# todo-frontend AWS Infrastructure (CloudFormation + CodeBuild/CodeDeploy)

Infrastructure-as-Code to host the React 19 + Vite **todo-frontend** SPA as an
**AWS Lambda Web Function** (a new capability), with all build artifacts in an
encrypted **S3** bucket, a **CodeBuild** build project, and a **CodeDeploy**
application.

> **This is not an automated end-to-end pipeline.** There is deliberately no
> `AWS::CodePipeline` and no CodeDeploy `DeploymentGroup`. The delivery flow is a
> set of correctly-wired parts with a **manual** build-to-cutover handoff: an
> operator runs CodeBuild, copies the `ArtifactObjectKey` from the build log,
> and runs a `cloudformation deploy` to update the Web Function endpoint's
> `RevisionWeights`. See [Build and cutover](#build-and-cutover) for why the
> handoff is manual for Lambda Web Functions and what the CodeDeploy application
> is (and is not) doing here.

> **No live deploy was performed.** These templates were authored and validated
> statically with cfn-lint and cfn-guard through the AWS IaC MCP. There is no
> AWS account, Docker daemon, or deploy target in the authoring sandbox, so the
> application build (`bun run build`), packaging, and the endpoint revision
> cutover all run in CodeBuild / CloudFormation at deploy time, not here. Lambda
> Web Functions is a **new** capability (announced 2026-10-12; CFN resources
> added 2026-09-29); validate the resource types against your account's region
> before deploying.

## Why a Node server for a static SPA?

The AWS Lambda Web Function **Node.js runtime loads `index.js` at the root of
the deployment package** by default (or the file named by the
`AWS_LAMBDA_NODEJS_ENTRYPOINT` env var). It does **not** run a `package.json`
script. It also provides the listen address as `AWS_LAMBDA_HTTP_ENDPOINT`
(`host:port`, e.g. `0.0.0.0:8080`), **not** as `PORT`. This is grounded in the
official AWS docs:

- <https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html>
- <https://docs.aws.amazon.com/lambda/latest/dg/web-functions-create.html>
- <https://aws.amazon.com/blogs/compute/exploring-aws-lambda-web-functions-for-building-web-applications/>

> An earlier revision assumed the Web Function would run a `serve` script and
> listen on `PORT`. That assumption was wrong (the companion backend 502'd for
> the analogous reason: the runtime could not find `index.js` at the package
> root). The entry is now `index.js` and it listens on `AWS_LAMBDA_HTTP_ENDPOINT`.

This app is a static Vite SPA (no SSR), so a tiny dependency-free Node static
server, [`index.js`](../index.js), is the Web Function entrypoint. It:

- serves the built `dist/` directory with correct `Content-Type` (including the
  PWA assets `sw.js` and `manifest.webmanifest`),
- returns `index.html` for unknown, non-asset routes (SPA client-side routing
  fallback), and returns `404` for missing files that look like assets,
- listens on the `host:port` from `AWS_LAMBDA_HTTP_ENDPOINT` (fallback
  `0.0.0.0:8080`); `process.env.PORT` is kept as a secondary fallback for local
  development,
- uses only Node built-ins (`http`, `fs`, `path`, `url`) - no extra deps to
  bundle, and guards against path traversal.

`index.js` loads as an ES module because `package.json` declares
`"type": "module"`. A `serve` npm script (`node index.js`) runs it locally.
**No React app or business logic was changed.**

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
      │                                      index.js serves dist/ on
      │                                      AWS_LAMBDA_HTTP_ENDPOINT)
      │
      │  the SPA's JS (with VITE_API_URL baked in at build time)
      │  calls the BACKEND directly from the browser
      ▼
   Backend Lambda Web Function Endpoint  (separate repo / stack: todo-backend)
   https://<backend-endpoint>/api

   Build + cutover (MANUAL handoff, not an automated pipeline):
     GitHub ─▶ CodeBuild (bun install → bun run build [VITE_API_URL baked]
              → zip dist/ + index.js + package.json → s3 cp
              → print ArtifactObjectKey) ─▶ S3 artifact bucket
     operator copies ArtifactObjectKey from the build log
     operator runs `cloudformation deploy` on app.yaml, which updates the
       WebFunctionEndpoint RevisionWeights to shift traffic to the new revision
```

The frontend server serves only static files; it never calls the backend. The
browser calls the backend Web Function endpoint over its public HTTPS URL, so
**no VPC connectivity is needed** for the frontend.

## Templates

| File | Stack | Contents |
|------|-------|----------|
| `cloudformation/app.yaml`      | app      | `AWS::Lambda::WebFunction` + `WebFunctionRevision` + `WebFunctionEndpoint`, least-privilege execution role (CloudWatch Logs only) |
| `cloudformation/pipeline.yaml` | pipeline | S3 artifact bucket (SSE-KMS, public access blocked, TLS-only, access-logged) + terminal access-log bucket, customer-managed KMS key, CodeBuild project, CodeDeploy application (ComputePlatform `Lambda`), least-privilege CodeBuild/CodeDeploy roles |
| `buildspec.yml`  | (CodeBuild) | `bun install` → `bun run build` (VITE_API_URL baked) → package → upload → print `ArtifactObjectKey` |

> The stack file is named `pipeline.yaml` for continuity, but it does not
> define an `AWS::CodePipeline`; it provisions the build/artifact/CodeDeploy
> primitives. There is no `appspec.yaml`: a CodeDeploy AppSpec would be consumed
> only by a CodeDeploy `DeploymentGroup` deployment, and there is none here. The
> revision cutover is a CloudFormation update to `RevisionWeights` in `app.yaml`
> (see [Build and cutover](#build-and-cutover)).

## Deploy order

Stacks use cross-stack `Export`/`ImportValue`, so deploy them in order. Each
step below is a separate manual action; there is no pipeline chaining them.

1. **pipeline** → exports `ArtifactBucketName` (+ KMS key / CodeBuild / CodeDeploy names)
2. Run the **CodeBuild** project → builds the frontend `.zip`, uploads it to the artifact bucket with `aws s3 cp`, and **prints** the `ArtifactObjectKey` to the build log. Copy that value.
3. **app** (pass `PipelineStackName` and the `ArtifactObjectKey` you copied from step 2) → creates/updates the Web Function revision and shifts endpoint traffic to it via `RevisionWeights`

Example (requires a real account/credentials; not run here):

```bash
aws cloudformation deploy --stack-name todo-frontend-pipeline --template-file infra/cloudformation/pipeline.yaml \
  --parameter-overrides ViteApiUrl=https://<backend-endpoint>/api --capabilities CAPABILITY_IAM
aws codebuild start-build --project-name todo-frontend-pipeline-build
aws cloudformation deploy --stack-name todo-frontend-app --template-file infra/cloudformation/app.yaml \
  --parameter-overrides PipelineStackName=todo-frontend-pipeline ArtifactObjectKey=todo-frontend/<sha>.zip \
  --capabilities CAPABILITY_IAM
```

## Build source and artifact key (S3-source builds)

The CodeBuild project's declared source is GitHub, but a one-off build can be
started from a source zip uploaded to S3 (`--source-type-override S3
--source-location-override <bucket>/<key>`). Two things matter for that path:

- **Pass `sourceVersion` = the S3 object's `VersionId`.** For an S3 source,
  `StartBuild` must be given `--source-version <VersionId>` (get it from the
  `aws s3api put-object` / `head-object` output of the source zip; the source
  bucket must be versioned). If it is omitted, CodeBuild does not reliably pick
  up the newly uploaded object and may build a stale one.
- **`CODEBUILD_RESOLVED_SOURCE_VERSION` is empty for S3 sources** (it is only the
  commit SHA for GitHub sources). The buildspec therefore derives the artifact
  key as follows, and fails the build (exit 1, message on stderr) if the result
  would be empty or just `todo-frontend/.zip`:

  | Source | Artifact key |
  |--------|--------------|
  | GitHub (or any source with a resolved version) | `todo-frontend/<CODEBUILD_RESOLVED_SOURCE_VERSION>.zip` |
  | S3 (resolved version empty) | `todo-frontend/build-<CODEBUILD_BUILD_NUMBER>-<epoch-seconds>.zip` |

  Read the exact key from the `ArtifactObjectKey=...` line in the build log and
  pass it to the `app` stack; do not guess it from a commit SHA when the source
  was S3.

The buildspec also **fails the build before `bun run build`** if `VITE_API_URL`
is empty or contains `example.` (the unedited `ViteApiUrl` placeholder default),
so a SPA pointing at a placeholder backend is never produced silently. Supply
the real backend API URL as the `ViteApiUrl` stack parameter (or a CodeBuild
environment variable override) at deploy time; never commit it.

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

## Build and cutover

This is a **manual** build-to-cutover handoff, not an automated pipeline. Be
precise about what each piece does:

- **CodeBuild** (`buildspec.yml`): install Bun → `bun install --frozen-lockfile`
  → `bun run build` (with `VITE_API_URL` baked) → `zip` `dist/` + `index.js` +
  `package.json` → `aws s3 cp` to the artifact bucket → **print** the
  `ArtifactObjectKey` to the build log. The server uses only Node built-ins, so
  no `node_modules` are bundled.

  The CodeBuild project is `Artifacts: Type: NO_ARTIFACTS`. That is correct for
  this design: the project uploads the `.zip` itself via `aws s3 cp`, so there
  is no build-output artifact for CodeBuild to export. The buildspec therefore
  has **no** top-level `artifacts:` block (a previous version did; it was dead
  config, silently discarded under `NO_ARTIFACTS`, and has been removed). The
  `ArtifactObjectKey` is surfaced by printing it to the log, not by a CodeBuild
  artifact export.

- **The handoff is manual.** There is no `AWS::CodePipeline` and no CodeDeploy
  `DeploymentGroup`, so nothing automatically carries the `ArtifactObjectKey`
  from the build into the app stack. An operator copies it from the build log
  and supplies it as the `app.yaml` `ArtifactObjectKey` parameter (step 2 → 3
  in [Deploy order](#deploy-order)).

- **The cutover** is a CloudFormation update to `RevisionWeights` on
  `AWS::Lambda::WebFunctionEndpoint` in `app.yaml` (set the new revision to
  `Weight: 100`, or split across two revisions for a canary). Lambda Web
  Functions shift traffic *natively* through `RevisionWeights`; there is no
  separate deploy descriptor to run.

### Why there is no CodeDeploy DeploymentGroup or appspec.yaml

Classic CodeDeploy Lambda deployments (a `DeploymentGroup` + an `appspec.yaml`
whose real schema is `Resources: - <name>: Type: AWS::Lambda::Function` with
`Name`/`Alias`/`CurrentVersion`/`TargetVersion` and a `hooks:` section) operate
on **alias versions of a traditional `AWS::Lambda::Function`**. They cannot
drive a `WebFunctionEndpoint`'s `RevisionWeights`, which is the native traffic
control for this new compute type. A valid CodeDeploy Lambda AppSpec would
therefore reference a resource this stack does not have, and no deployment here
would consume it. For that reason **there is no `appspec.yaml`** in this repo
(an earlier illustrative file used an invented `WebFunctionEndpoint`/
`TrafficShifting` schema that is not a real CodeDeploy AppSpec and was consumed
by nothing; it has been removed to avoid implying an operative deploy
descriptor exists).

The `AWS::CodeDeploy::Application` (`ComputePlatform: Lambda`) is kept
deliberately, because the task asks to use CodeDeploy, but it is honestly a
**placeholder**: it has no deployment group and does not perform the Web
Function cutover. It reserves the CodeDeploy application for a future
classic-`AWS::Lambda::Function` migration path (where a `DeploymentGroup` +
AppSpec would apply). Until then, the operative cutover is the `RevisionWeights`
update described above.

## CI/CD pipeline safety

`buildspec.yml` **never dumps the full environment**: there is no `printenv`,
bare `env`, `set -x`/`set +x`, `process.env`, or `os.environ` dump anywhere.
Each step references only the specific variables it needs (`ARTIFACT_BUCKET`,
`VITE_API_URL`). The only value echoed is the non-sensitive `ArtifactObjectKey`
(an S3 object key, not a secret). The CodeBuild project declares only those two
variables. `index.js` logs a single non-sensitive startup line and never
prints `process.env`.

## Prerequisites

- An AWS account and credentials with permission to create the resources above.
- A region where Lambda Web Functions are available.
- A GitHub source connection for CodeBuild to clone the repo.
- `CAPABILITY_IAM` when deploying (the stacks create IAM roles).

## Validation

Every CloudFormation template was validated through the AWS IaC MCP:
cfn-lint (`validate_cloudformation_template`) and cfn-guard
(`check_cloudformation_template_compliance`). The `buildspec.yml` is plain config
(not CloudFormation) and was reviewed manually. The Vite build was run locally
(`bun run build`) to confirm the `index.js` / `serve` static server did not
break it; `dist/` built successfully with `sw.js` and `manifest.webmanifest`
emitted. The `index.js` entry was also booted locally with
`AWS_LAMBDA_HTTP_ENDPOINT=127.0.0.1:8080 node index.js` and `GET /` returned
`200` with `index.html`.

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

Re-validated after the semantic-review follow-up edits to `pipeline.yaml`
(comment/description-only changes; `app.yaml` was unchanged):

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

**pipeline.yaml — 7 violations (unchanged after re-validation), all addressed or justified:**

| Rule | Status / Justification |
|------|------------------------|
| `S3_BUCKET_SSL_REQUESTS_ONLY` | **Addressed.** Both buckets have a `BucketPolicy` that `Deny`s all requests where `aws:SecureTransport` is `false`. cfn-guard inspects the `AWS::S3::Bucket` resource in isolation and does not trace the separate `AWS::S3::BucketPolicy`, so it still flags this; TLS-only is enforced. |
| `S3_BUCKET_NO_PUBLIC_RW_ACL` | **Addressed.** ACLs are disabled entirely (`OwnershipControls: BucketOwnerEnforced`) and all four `PublicAccessBlockConfiguration` settings are `true`; no public ACL is possible. |
| `S3_BUCKET_LOGGING_ENABLED` | **Addressed for the artifact bucket** (`LoggingConfiguration` → `AccessLogBucket`). The finding remaining is for the terminal **access-log bucket itself**, which intentionally does not log to itself (that would recurse) — the standard terminal log-bucket pattern. |
| `S3_BUCKET_VERSIONING_ENABLED` | **Addressed for the artifact bucket** (`VersioningConfiguration: Enabled`). Flagged for the access-log bucket, where versioning is unnecessary for short-lived, 90-day-expiry access logs. |
| `S3_BUCKET_DEFAULT_LOCK_ENABLED` | **Justified.** Object Lock (WORM) is inappropriate for a transient, versioned build-artifact bucket whose old versions expire after 30 days, and for short-lived access logs. |
| `S3_BUCKET_REPLICATION_ENABLED` | **Justified.** Cross-region replication is unnecessary for rebuildable build artifacts and access logs; it would add cost and complexity with no durability benefit for this use case. |
| `IAM_NO_INLINE_POLICY_CHECK` | **Justified.** The CodeBuild role uses inline policies scoped to exactly the log group, the one artifact bucket, and the one KMS key it needs (least privilege). The CodeDeploy role uses only the AWS-managed `AWSCodeDeployRoleForLambda`. |

## Semantic-review follow-up

A semantic review (`NEEDS_CHANGES`) raised six honesty/consistency issues. How
each is handled in this repo:

1. **Dead `artifacts:` block vs `NO_ARTIFACTS`** — *fixed.* The `artifacts:`
   block was removed from `buildspec.yml`; the project stays `NO_ARTIFACTS`
   (correct, since the `.zip` is uploaded by `aws s3 cp`), and the
   `ArtifactObjectKey` is now printed to the build log and passed by hand.
2. **"Pipeline" implied automation that does not exist** — *fixed.* The README,
   the `pipeline.yaml` description, and the architecture diagram now state
   plainly that there is no `AWS::CodePipeline`, that the build-to-cutover
   handoff is manual, and that the cutover is a `cloudformation deploy` updating
   `RevisionWeights`.
3. **`appspec.yaml` was not a valid CodeDeploy AppSpec** — *fixed.* The file was
   removed (it used an invented schema and was consumed by nothing); its cutover
   guidance now lives in [Build and cutover](#build-and-cutover). The real
   CodeDeploy Lambda AppSpec schema (`Type: AWS::Lambda::Function` with
   `Name`/`Alias`/`CurrentVersion`/`TargetVersion` + `hooks:`) is noted there as
   the reason it does not apply to a `WebFunctionEndpoint`.
4. **CodeDeploy application is decorative** — *justified + labelled.* The
   `AWS::CodeDeploy::Application` is kept (the task asks to use CodeDeploy) but
   is now explicitly a placeholder for a future classic-`AWS::Lambda::Function`
   path, both in the README and in a comment in `pipeline.yaml`. It does not
   drive the Web Function cutover.
5. **App-secret rotation** — *not applicable to todo-frontend.* This repo has no
   secrets at all (`VITE_API_URL` is a public build-time value). The finding is
   backend-only (`JwtSecret` / `ReminderDispatchSecret` live in `todo-backend`).
6. **Aurora `EngineVersion` default** — *not applicable to todo-frontend.* There
   is no database in this repo; Aurora lives in `todo-backend`.

## What still requires a live AWS account

- Actually deploying the stacks, running CodeBuild, and performing the endpoint
  revision cutover.
- Confirming region availability of Lambda Web Functions.
- Setting up the CodeBuild GitHub source connection.
- Supplying the real backend endpoint URL as `ViteApiUrl` so the SPA is built
  against the live backend API base.
