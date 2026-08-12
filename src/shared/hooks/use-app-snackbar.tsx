import {
  Snackbar,
  SnackbarProvider,
  type SnackbarProps,
  useSnackbarAdapter,
} from "seed-design/ui/snackbar";
import type { PropsWithChildren } from "react";

type SnackbarVariant = NonNullable<SnackbarProps["variant"]>;

const SNACKBAR_TIMEOUT_MS = 3_000;

export function AppSnackbarProvider({ children }: PropsWithChildren) {
  return (
    <SnackbarProvider pauseOnInteraction={false}>
      {children}
    </SnackbarProvider>
  );
}

export function useAppSnackbar() {
  const adapter = useSnackbarAdapter();

  return (message: string, variant: SnackbarVariant = "default") =>
    adapter.create({
      timeout: SNACKBAR_TIMEOUT_MS,
      render: () => <Snackbar message={message} variant={variant} />,
    });
}
