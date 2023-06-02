import { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Clock from '../components/Clock';
import Footer from '../components/footer';
import '../styles/index.css';
import 'tailwindcss/tailwind.css';


const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  return (
    <div className="App background-img" id="tsparticles">
      {/* <ParticleBG /> */}
      <header className="bg-gray-800 text-white py-4 px-16 flex justify-around items-center">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="text-left flex-1">PC Status</div>
        <div>
          <Clock />
        </div>
        <nav className="flex-1">
          <ul className="flex space-x-4 justify-end">
            <li>
              <Link href="/" legacyBehavior>
                <a className={router.pathname === '/' ? 'active' : ''}>Domov</a>
              </Link>
            </li>
            <li>
              <Link href="/computers" legacyBehavior>
                <a className={router.pathname === '/computers' ? 'active' : ''}>Počítače</a>
              </Link>
            </li>
            <li>
              <Link href="/add" legacyBehavior>
                <a className={router.pathname === '/add' ? 'active' : ''}>Pridať Počítač</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <div className="content">
        <Component {...pageProps} />
        <Footer />
      </div>
    </div>
  );
};

export default App;
