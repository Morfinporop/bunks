import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <div className="text-green-500/20 text-[12rem] font-black leading-none select-none">404</div>
      <h1 className="text-white text-3xl font-bold mt-4 mb-2">Страница не найдена</h1>
      <p className="text-gray-500 font-mono text-sm mb-8">Этот сектор бункера не существует</p>
      <Link to="/" className="btn-primary px-8">
        ← На главную
      </Link>
    </div>
  );
}
