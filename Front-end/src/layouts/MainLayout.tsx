import { Layout } from "antd";
import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout>
      <Navbar />

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;