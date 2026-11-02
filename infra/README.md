# todo-frontend AWS Infrastructure (CloudFormation + CodeBuild/CodeDeploy)

Infrastructure-as-Code to host the React 19 + Vite **todo-frontend** SPA as an
**AWS Lambda Web Function** (a new capability), with all build artifacts in an
encrypted **S3** bucket and a **CodeBuild + CodeDeploy** delivery pipeline.

> **No live deploy was performed.** These templates were authored and validated
> statically with cfn-lint and cfn-guard through the AWS IaC MCP. There is no
> AWS account, Docker daemon, or deploy target in the authoring sandbox, so the
> application build (`bun run build`), packaging, and the endpoint revision
> cutover all run in CodeBuild / CloudFormation at deploy time, not here. Lambda
> Web Functions is a **new** capability (announced 2026-10-12; CFN resources
> added 2026-09-29); validate the resource types against your account's region
> before deploying.

## Why a Node server for a static SPA?

A Lambda Web Function runs a standard Node.js HTTP server process that listens
on a port. This app is a static Vite SPA (no SSR), so a tiny dependency-free
Node static server, [`server.mjs`](../server.mjs), is the Web Function
entrypoint. It:

- serves the built `dist/` directory with correct `Content-Type` (including the
  PWA assets `sw.js` and `manifest.webmanifest`),
- returns `index.html` for unknown, non-asset routes (SPA client-side routing
  fallback), and returns `404` for missing files that look like assets,
- listens on `process.env.PORT` (default `8080`),
- uses only Node built-ins (`http`, `fs`, `path`, `url`) - no extra deps to
  bundle, and guards against path traversal.

A `serve` npm script (`node server.mjs`) runs it. **No React app or business
logic was changed.**

## Architecture

```
                         HTTPS
   client ───────────────────────────────▶  Frontend Lambda Web Function Endpoint
   (browser)                                 (AuthType: ApplicationManaged,
      │                                        EndpointType: HomeRegion)
      │                                               │  RevisionWeights
      │                                               ▼
      │                                     WebFunctionRevision
      │                                     (code .zip from S3,
      │                                      Runtime nodejs24.x,
      │                                      server.mjs serves dist/ on PORT 8080)
      │
      │  the SPA's JS (with VITE_API_URL baked in at build time)
      │  calls the BACKEND directly from the browser
      ▼
   Backend Lambda Web Function Endpoint  (separate repo / stack: todo-backend)
   https://<backend-endpoint>/api

   CI/CD:  GitHub ─▶ CodeBuild (bun install → bun run build [VITE_API_URL baked]
           → zip dist/ + server.mjs + package.json → s3 cp) ─▶ S3 artifact bucket
           ─▶ CodeDeploy (Lambda) / WebFunctionEndpoint RevisionWeights cutover
```

The frontend server serves only static files; it never calls the backend. The
browser calls the backend Web Function endpoint over its public HTTPS URL, so
**no VPC connectivity is needed** for the frontend.

## Templates

| File | Stack | Contents |
|------|-------|----------|
| `cloudformation/app.yaml`      | app      | `AWS::Lambda::WebFunction` + `WebFunctionRevision` + `WebFunctionEndpoint`, least-privilege execution role (CloudWatch Logs only) |
| `cloudformation/pipeline.yaml` | pipeline | S3 artifact bucket (SSE-KMS, public access blocked, TLS-only, access-logged) + terminal access-log bucket, customer-managed KMS key, CodeBuild project, CodeDeploy application (ComputePlatform `Lambda`), least-privilege CodeBuild/CodeDeploy roles |
| `buildspec.yml`  | (CodeBuild) | `bun install` → `bun run build` (VITE_API_URL baked) → package → upload |
| `appspec.yaml`   | (CodeDeploy) | Revision/endpoint cutover descriptor |

## Deploy order

Stacks use cross-stack `Export`/`ImportValue`, so deploy them in order:

1. **pipeline** → exports `ArtifactBucketName` (+ KMS key / CodeBuild / CodeDeploy names)
2. Run the **CodeBuild** project → produces the frontend `.zip` in the artifact bucket and emits `artifact.json` with the `ArtifactObjectKey`
3. **app** (pass `PipelineStackName` and the `ArtifactObjectKey` emitted by the build) → creates/updates the Web Function revision and shifts endpoint traffic to it

Example (requires a real account/credentials; not run here):

```bash
aws cloudformation deploy --stack-name todo-frontend-pipeline --template-file infra/cloudformation/pipeline.yaml \
  --parameter-overrides ViteApiUrl=https://<backend-endpoint>/api --capabilities CAPABILITY_IAM
aws codebuild start-build --project-name todo-frontend-pipeline-build
aws cloudformation deploy --stack-name todo-frontend-app --template-file infra/cloudformation/app.yaml \
  --parameter-overrides PipelineStackName=todo-frontend-pipeline ArtifactObjectKey=todo-frontend/<sha>.zip \
  --capabilities CAPABILITY_IAM
```

## Parameters

- **pipeline.yaml**: `SourceRepositoryUrl`, `SourceBranch` (`feat/aws-iac-cicd`), `ViteApiUrl` (the backend API base URL baked into the SPA at build time; default is a placeholder).
- **app.yaml**: `PipelineStackName`, `ArtifactObjectKey`, `Runtime` (`nodejs24.x`), `FunctionName` (`todo-frontend-web`), `Port` (`8080`), `TimeoutSeconds` (`30`).

## `VITE_API_URL` wiring (build-time only)

Vite inlines `VITE_*` environment variables into the client bundle during
`vite build`. The backend API base URL is therefore a **build-time** value, not
a runtime one:

- The `pipeline.yaml` CodeBuild project declares `VITE_API_URL` as a
  `PLAINTEXT` environment variable (sourced from the `ViteApiUrl` stack
  parameter).
- `buildspec.yml` references it **only** on the single `bun run build` step
  (`VITE_API_URL="$VITE_API_URL" bun run build`), so it is baked into `dist/`.
- The Web Function revision (`app.yaml`) does **not** set `VITE_API_URL`: it has
  no runtime effect; the value is already compiled into the static assets.

`VITE_API_URL` is a **public** config value (it ends up in client-side assets
the browser downloads), so it is not a secret. There are **no secrets** anywhere
in these templates or the pipeline.

## CodeBuild + CodeDeploy flow

- **CodeBuild** (`buildspec.yml`): install Bun → `bun install --frozen-lockfile`
  → `bun run build` (with `VITE_API_URL` baked) → `zip` `dist/` + `server.mjs` +
  `package.json` → `aws s3 cp` to the artifact bucket → emit `artifact.json`
  with the `ArtifactObjectKey`. The server uses only Node built-ins, so no
  `node_modules` are bundled.
- **CodeDeploy** (`AWS::CodeDeploy::Application`, `ComputePlatform: Lambda`) is
  provisioned as the deployment controller. **Honest note:** Lambda Web
  Functions shift traffic *natively* through the endpoint's `RevisionWeights`
  (one or two revisions with weights) rather than through classic CodeDeploy
  Lambda *alias* deployment groups, which target a traditional
  `AWS::Lambda::Function`. The cutover is therefore expressed by updating
  `RevisionWeights` on `AWS::Lambda::WebFunctionEndpoint` in `app.yaml`; the
  CodeDeploy application is wired in as the delivery controller and
  `appspec.yaml` documents the revision cutover contract.

## CI/CD pipeline safety

`buildspec.yml` and `appspec.yaml` **never dump the full environment**: there is
no `printenv`, bare `env`, `set -x`/`set +x`, `process.env`, or `os.environ`
dump anywhere. Each step references only the specific variables it needs
(`ARTIFACT_BUCKET`, `VITE_API_URL`). The CodeBuild project declares only those
two variables. `server.mjs` logs a single non-sensitive startup line and never
prints `process.env`.

## Prerequisites

- An AWS account and credentials with permission to create the resources above.
- A region where Lambda Web Functions are available.
- A GitHub source connection for CodeBuild to clone the repo.
- `CAPABILITY_IAM` when deploying (the stacks create IAM roles).

## Validation

Every CloudFormation template was validated through the AWS IaC MCP:
cfn-lint (`validate_cloudformation_template`) and cfn-guard
(`check_cloudformation_template_compliance`). The `buildspec.yml` and
`appspec.yaml` are plain config (not CloudFormation) and were reviewed manually.
The Vite build was run locally (`bun run build`) to confirm the added
`server.mjs` / `serve` script did not break it; `dist/` built successfully with
`sw.js` and `manifest.webmanifest` emitted.

### Cited AWS documentation

- Lambda Web Functions (overview) — <https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html>
- Announcement — <https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/>
- AWS::Lambda::WebFunction — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-webfunction.md>
- AWS::Lambda::WebFunctionRevision — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-webfunctionrevision.md>
- AWS::Lambda::WebFunctionRevision ServiceConfig — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-lambda-webfunctionrevision-serviceconfig.md>
- AWS::Lambda::WebFunctionEndpoint — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-webfunctionendpoint.md>
- AWS::S3::Bucket — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-s3-bucket.md>
- AWS::CodeBuild::Project — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-codebuild-project.md>
- AWS::CodeDeploy::Application — <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-codedeploy-application.md>

### cfn-lint results (error_count driven to 0)

| Template | Errors | Warnings | Info |
|----------|:------:|:--------:|:----:|
| app.yaml      | 0 | 0 | 0 |
| pipeline.yaml | 0 | 0 | 0 |

No `ignore_checks` were needed. Notably, cfn-lint **does** have schemas for the
new `AWS::Lambda::WebFunction*` types: it validated the `BuildConfig`,
`ServiceConfig`, `RevisionWeights`, `AuthType`, and `EndpointType` properties
without emitting any unknown-resource-type finding, so no suppression was
required.

### cfn-guard results (findings addressed or justified)

cfn-guard runs the bundled `aws-security` rule set.

**app.yaml — 1 violation, justified:**

| Rule | Justification |
|------|---------------|
| `IAM_NO_INLINE_POLICY_CHECK` | The execution role uses a single inline policy granting only CloudWatch Logs `CreateLogGroup`/`CreateLogStream`/`PutLogEvents` scoped to `/aws/lambda/*`. This is least privilege; replacing it with a broad AWS-managed policy would be less secure. |

**pipeline.yaml — 7 violations, all addressed or justified:**

| Rule | Status / Justification |
|------|------------------------|
| `S3_BUCKET_SSL_REQUESTS_ONLY` | **Addressed.** Both buckets have a `BucketPolicy` that `Deny`s all requests where `aws:SecureTransport` is `false`. cfn-guard inspects the `AWS::S3::Bucket` resource in isolation and does not trace the separate `AWS::S3::BucketPolicy`, so it still flags this; TLS-only is enforced. |
| `S3_BUCKET_NO_PUBLIC_RW_ACL` | **Addressed.** ACLs are disabled entirely (`OwnershipControls: BucketOwnerEnforced`) and all four `PublicAccessBlockConfiguration` settings are `true`; no public ACL is possible. |
| `S3_BUCKET_LOGGING_ENABLED` | **Addressed for the artifact bucket** (`LoggingConfiguration` → `AccessLogBucket`). The finding remaining is for the terminal **access-log bucket itself**, which intentionally does not log to itself (that would recurse) — the standard terminal log-bucket pattern. |
| `S3_BUCKET_VERSIONING_ENABLED` | **Addressed for the artifact bucket** (`VersioningConfiguration: Enabled`). Flagged for the access-log bucket, where versioning is unnecessary for short-lived, 90-day-expiry access logs. |
| `S3_BUCKET_DEFAULT_LOCK_ENABLED` | **Justified.** Object Lock (WORM) is inappropriate for a transient, versioned build-artifact bucket whose old versions expire after 30 days, and for short-lived access logs. |
| `S3_BUCKET_REPLICATION_ENABLED` | **Justified.** Cross-region replication is unnecessary for rebuildable build artifacts and access logs; it would add cost and complexity with no durability benefit for this use case. |
| `IAM_NO_INLINE_POLICY_CHECK` | **Justified.** The CodeBuild role uses inline policies scoped to exactly the log group, the one artifact bucket, and the one KMS key it needs (least privilege). The CodeDeploy role uses only the AWS-managed `AWSCodeDeployRoleForLambda`. |

## What still requires a live AWS account

- Actually deploying the stacks, running CodeBuild, and performing the endpoint
  revision cutover.
- Confirming region availability of Lambda Web Functions.
- Setting up the CodeBuild GitHub source connection.
- Supplying the real backend endpoint URL as `ViteApiUrl` so the SPA is built
  against the live backend API base.
