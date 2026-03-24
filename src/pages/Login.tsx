import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TreePine } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        toast({ title: 'Conta criada!', description: 'Verifique seu e-mail para confirmar.' });
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <TreePine className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Madeiras Teresense</CardTitle>
          <CardDescription>CRM de Vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <Input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
