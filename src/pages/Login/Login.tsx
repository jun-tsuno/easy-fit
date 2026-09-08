import { Button, Input } from "@chakra-ui/react";
import { type FormEvent, useState } from "react";
import { Navigate } from "react-router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useAuth } from "@/providers/AuthProvider";
import titleStyles from "@/styles/brand-title.module.css";
import styles from "./Login.module.css";

export function LoginPage() {
  const { status, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError("メールアドレスまたはパスワードが正しくありません。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className={styles.container}>
      <h1 className={titleStyles.title}>easy-fit</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            メールアドレス
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            パスワード
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" loading={isSubmitting} mt="2">
          ログイン
        </Button>
      </form>
    </PageContainer>
  );
}
