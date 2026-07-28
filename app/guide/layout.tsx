export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      {children}
    </div>
  );
}
