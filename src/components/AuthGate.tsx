import { FormEvent, ReactNode, useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AlertCircle, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '@/assets/logo.png';

type Screen = 'sign-in' | 'forgot-password' | 'update-password';

interface AuthGateProps {
  children: ReactNode;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        setIsMember(null);
        if (event === 'PASSWORD_RECOVERY') setScreen('update-password');
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsMember(null);
      return;
    }

    let active = true;
    setLoading(true);
    supabase.rpc('is_planning_member').then(({ data, error: membershipError }) => {
      if (!active) return;
      if (membershipError) {
        setError('Impossible de vérifier votre autorisation. Contactez le responsable technique.');
        setIsMember(false);
      } else {
        setIsMember(data === true);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session]);

  const clearFeedback = () => {
    setError(null);
    setMessage(null);
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setMessage('Si ce compte existe, un lien de réinitialisation vient d’être envoyé.');
    } catch (resetError) {
      setError(getErrorMessage(resetError));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent) => {
    event.preventDefault();
    clearFeedback();
    if (password.length < 12) {
      setError('Le nouveau mot de passe doit contenir au moins 12 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword('');
      setConfirmPassword('');
      setScreen('sign-in');
      setMessage('Mot de passe mis à jour. Vous pouvez maintenant utiliser l’application.');
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Vérification de l’accès…
        </div>
      </div>
    );
  }

  if (session && screen !== 'update-password' && isMember) return <>{children}</>;

  const unauthorized = Boolean(session && screen !== 'update-password' && isMember === false);

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <img src={logo} alt="Doggy Oasis International" className="mx-auto mb-3 h-16 w-auto" />
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <LockKeyhole className="h-5 w-5" />
            Planning Pro
          </CardTitle>
          <CardDescription>Application interne de Doggy Oasis International</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Accès impossible</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {unauthorized ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ce compte existe, mais il n’est pas autorisé à accéder au planning. Demandez au responsable
                technique de l’ajouter aux membres de l’application.
              </p>
              <Button className="w-full" variant="outline" onClick={() => supabase.auth.signOut()}>
                Se déconnecter
              </Button>
            </div>
          ) : screen === 'update-password' ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer le nouveau mot de passe
              </Button>
            </form>
          ) : screen === 'forgot-password' ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Adresse e-mail</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer le lien de réinitialisation
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="ghost"
                onClick={() => {
                  clearFeedback();
                  setScreen('sign-in');
                }}
              >
                Retour à la connexion
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="ghost"
                onClick={() => {
                  clearFeedback();
                  setScreen('forgot-password');
                }}
              >
                Mot de passe oublié ?
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
