import { Layout } from "antd";
import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import ChatWidget from "../components/ChatWidget/ChatWidget";
import styles from "./MainLayout.module.css";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout>
      <Navbar />

      <Content className={styles.content}>
        <Outlet />
      </Content>

      <ChatWidget />
    </Layout>
  );
};

export default MainLayout;