import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

function getRouteErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return '요청한 페이지를 찾을 수 없어요.';
    }

    return error.statusText || '페이지를 불러오지 못했어요.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '페이지를 불러오지 못했어요.';
}

export default function RouteErrorPage() {
  const error = useRouteError();
  const message = getRouteErrorMessage(error);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-8 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900">잠시 문제가 생겼어요</h1>
        <p className="mt-3 text-sm text-gray-500">{message}</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#FFDD86] px-6 text-sm font-semibold text-black hover:brightness-95 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
