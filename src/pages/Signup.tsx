import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSignup } from '@/hooks/useAuth';

export function Signup() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signupMutation = useSignup();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({ email, password, name: name.trim() || undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('common.appName')}
            </span>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('auth.signUpTitle')}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <Input
            label={t('auth.name')}
            type="text"
            autoComplete="name"
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button
            type="submit"
            className="w-full"
            loading={signupMutation.isPending}
            disabled={signupMutation.isPending}
          >
            {t('auth.createAccount')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            {t('auth.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
