
const Header = () => {
  return (
    <header className="border-b pb-1 border-slate-200 px-4 py-1">
        <div className="flex justify-between items-center">

        {/* left */}
        <div className="flex flex-col">
        <h2 className="text-slate-900 font-medium">LinkSpace</h2>
        <p className="text-sm text-slate-700">Your corner of the internet</p>
        </div>

        {/* right */}
        <div>
            <button className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-md cursor-pointer">
                Publish
            </button>
        </div>
        </div>
    </header>
  )
}

export default Header