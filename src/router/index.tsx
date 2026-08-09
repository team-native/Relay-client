import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/home/HomePage';
import NoticeListPage from '../pages/notice/NoticeListPage';
import NoticeDetailPage from '../pages/notice/NoticeDetailPage';
import StudyCreatePage from '../pages/study/StudyCreatePage';
import StudyDetailPage from '../pages/study/StudyDetailPage';
import MyPage from '../pages/mypage/MyPage';
import ProfileEditPage from '../pages/mypage/ProfileEditPage';
import PasswordChangePage from '../pages/mypage/PasswordChangePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'studies/new', element: <StudyCreatePage /> },
      { path: 'studies/:studyId', element: <StudyDetailPage /> },
      { path: 'notices', element: <NoticeListPage /> },
      { path: 'notices/:noticeId', element: <NoticeDetailPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'mypage/profile', element: <ProfileEditPage /> },
      { path: 'mypage/password', element: <PasswordChangePage /> },
    ],
  },
]);