import { FaMagnifyingGlass } from "react-icons/fa6";
import "../public.css";

import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { showClassroom } from "../../../_services/classrooms";

export default function Classroom() {
  const { switchLoading, setAllertSetting, state } = useOutletContext();

  const { class_code } = useParams();

  const [user, setUser] = useState({});
  const [classroom, setClassroom] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";
      user?.uid;

      try {
        switchLoading(true);

        const [storageData, classroomData] = await Promise.all([
          showUser(fixUser?.uid),
          showClassroom(class_code),
        ]);

        console.log(classroomData);

        setUser(storageData);
        setClassroom(classroomData);
      } catch (error) {
        console.log("Fetch error:", error);

        setAllertSetting({
          isActive: true,
          message: error,
          isSuccess: false,
        });
      } finally {
        setTimeout(() => switchLoading(false), 100);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tempUser = localStorage.getItem("user");
    const fixUser = tempUser ? JSON.parse(tempUser) : "";

    setUser(state?.data);
    setClassroom(
      fixUser?.role === "Asisten"
        ? state?.data?.assists
        : state?.data?.classrooms
    );
  }, [state]);

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">{classroom?.name}</h1>
        </section>
        <section className="right__public-page">
          <div className="input__public-page">
            <input
              type="search"
              placeholder="Search by anything"
              title="Search classrooms"
            />
            <FaMagnifyingGlass className="icon__public-page" />
          </div>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="single-content__public-page span-3__public-page"></div>
      </div>
    </main>
  );
}
