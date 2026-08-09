import {
  Snackbar,
  type SnackbarProps,
  useSnackbarAdapter,
} from "seed-design/ui/snackbar";

type SnackbarVariant = NonNullable<SnackbarProps["variant"]>;

export function useAppSnackbar() {
  const adapter = useSnackbarAdapter();

  return (message: string, variant: SnackbarVariant = "default") =>
    adapter.create({
      render: () => <Snackbar message={message} variant={variant} />,
    });
}
