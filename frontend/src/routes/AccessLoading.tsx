type AccessLoadingProps = {
  message?: string;
};

export default function AccessLoading({ message = "Carregando..." }: AccessLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1b1b1f] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-white/70">{message}</p>
      </div>
    </div>
  );
}
