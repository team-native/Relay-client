import { Navigate, createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RouteErrorPage from '../components/layout/RouteErrorPage';
import HomePage from '../pages/home/HomePage';
import NoticeListPage from '../pages/notice/NoticeListPage';
import NoticeDetailPage from '../pages/notice/NoticeDetailPage';
import NoticeFormPage from '../pages/notice/NoticeFormPage'; // 👈 1. Import 추가!
import MyPage from '../pages/mypage/MyPage';
import ProfileEditPage from '../pages/mypage/ProfileEditPage';
import PasswordChangePage from '../pages/mypage/PasswordChangePage';
import StudyCreatePage from '../pages/study/StudyCreatePage';
import StudyDetailPage from '../pages/study/StudyDetailPage';

import Login from '../pages/Login/Login';
import Signup from '../pages/Signup/Signup';
import VerifyEmail from '../pages/VerifyEmail/VerifyEmail';

export const router = createBrowserRouter([
  { path: '/login', element: <Login />, errorElement: <RouteErrorPage /> },
  { path: '/signup', element: <Signup />, errorElement: <RouteErrorPage /> },
  { path: '/verify', element: <VerifyEmail />, errorElement: <RouteErrorPage /> },
  { path: '/verify-email', element: <VerifyEmail />, errorElement: <RouteErrorPage /> },
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'new', element: <StudyCreatePage /> },
      { path: 'lecture/:studyId', element: <StudyDetailPage /> },
      
      // 📌 공지사항 관련 라우트 수정
      { path: 'notice', element: <NoticeListPage /> },
      { path: 'notice/new', element: <NoticeFormPage /> }, // 👈 2. 공지 작성 (상세페이지보다 위에!)
      { path: 'notice/:noticeId', element: <NoticeDetailPage /> },
      { path: 'notice/:noticeId/edit', element: <NoticeFormPage /> }, // 👈 3. 공지 수정
      
      { path: 'mypage', element: <MyPage /> },
      { path: 'mypage/profile', element: <ProfileEditPage /> },
      { path: 'mypage/password', element: <PasswordChangePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);