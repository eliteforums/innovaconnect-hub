const PortalLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
        LOADING YOUR PORTAL...
      </p>
    </div>
  </div>
);

export default PortalLoading;
