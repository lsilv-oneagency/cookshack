export default function ShopLoading() {
  return (
    <>
      <div className="bg-[#1A1A1A] border-b border-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-3 bg-[#2B2B2B] rounded w-32 mb-4 animate-pulse" />
          <div className="h-10 bg-[#2B2B2B] rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="bg-[#F5F0EB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-white border border-[#E8E0D8] rounded overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#F0EBE3]" />
                <div className="p-4 space-y-3">
                  <div className="h-2.5 bg-[#E8E0D8] rounded w-1/3" />
                  <div className="h-4 bg-[#E8E0D8] rounded w-4/5" />
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-5 bg-[#E8E0D8] rounded w-1/3" />
                    <div className="h-7 bg-[#E8E0D8] rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
