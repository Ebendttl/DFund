import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t-4 border-black bg-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-black uppercase tracking-tighter">CrowdStack</h3>
            <p className="max-w-xs text-sm font-medium text-gray-600">
              Decentralized crowdfunding on Stacks. Transparent, secure, and community-driven.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold uppercase">
            <Link href="/" className="hover:text-yellow-600">Explore</Link>
            <Link href="/create" className="hover:text-yellow-600">Create</Link>
            <a href="https://explorer.hiro.so" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">Explorer</a>
          </div>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <div className="rounded-full border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black uppercase">
              Stacks Testnet
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              © 2024 CrowdStack. Built with Stacks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
