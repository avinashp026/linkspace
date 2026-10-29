import { logout } from "@/app/logout/actions";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E8ED] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 sm:h-16 sm:px-8">
        <span className="text-[19px] font-semibold tracking-tight text-[#1D1D1F]">
          LinkSpace
        </span>

        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-[13px] text-[#6E6E73] sm:inline">
            Draft saved
          </span>

          <form action={logout}>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-full border border-[#E8E8ED] px-4 text-sm font-medium text-[#1D1D1F] transition hover:bg-[#F5F5F7] active:scale-[0.98]"
            >
              Sign out
            </button>
          </form>

          <button
            type="button"
            className="h-11 cursor-pointer rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition hover:bg-black active:scale-[0.98]"
          >
            Publish
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;