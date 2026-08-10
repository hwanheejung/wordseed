import {
  Snackbar,
  type SnackbarProps,
  useSnackbarAdapter,
} from "seed-design/ui/snackbar";

type SnackbarVariant = NonNullable<SnackbarProps["variant"]>;

const SNACKBAR_TIMEOUT_MS = 3_000;

export function useAppSnackbar() {
  const adapter = useSnackbarAdapter();

  return (message: string, variant: SnackbarVariant = "default") =>
    adapter.create({
      timeout: SNACKBAR_TIMEOUT_MS,
      render: () => <Snackbar message={message} variant={variant} />,
    });
}
