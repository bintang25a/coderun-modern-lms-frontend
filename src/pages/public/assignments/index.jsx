import { FaMagnifyingGlass } from "react-icons/fa6";
import "../public.css";

import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { formatDate } from "../../../_utilities/formatDate";

const AssignmentList = ({ item }) => {
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const userRole = pathParts[0];

  return (
    <Link
      to={`/${userRole}/classrooms/${item?.class_code}/${item?.assignment_number}`}
      className="assignment-list__public-page"
    >
      <h2 title={item?.title} className="title-text__public-page">
        {item?.title}
      </h2>
      <div className="text-container__public-page">
        <p
          title={`Class: ${item?.class_code} / Uploaded by: ${item?.assistant_uid}`}
          className="text-top__public-page"
        >
          Class: {item?.class_code} / Uploaded by: {item?.assistant_uid}
        </p>
        <p
          title={`Due date: ${formatDate(item?.endAt)}`}
          className="text-bottom__public-page"
        >
          Due date: {formatDate(item?.endAt)}
        </p>
      </div>
    </Link>
  );
};

export default function Assignments() {
  const { switchLoading, setAllertSetting, state } = useOutletContext();

  const [user, setUser] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";

      try {
        switchLoading(true);

        const [storageData] = await Promise.all([showUser(fixUser?.uid)]);

        const tempClassrooms =
          fixUser?.role === "Asisten"
            ? storageData?.assists
            : storageData?.classrooms;

        const tempAssignments = tempClassrooms?.flatMap((c) => c?.assignments);

        setUser(storageData);
        setAssignments(tempAssignments);
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
    const tempAssignments = state?.classrooms?.flatMap((c) => c?.assignments);

    setUser(state?.data || {});
    setAssignments(tempAssignments || []);
  }, [state]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = assignments?.filter((item) => {
    const columnsToSearch = [
      "assignment_number",
      "title",
      "class_code",
      "assistant_uid",
    ];

    return columnsToSearch.some((key) => {
      const value = item[key];

      if (value === null || value === undefined) return false;

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">Assignments</h1>
        </section>
        <section className="right__public-page">
          <div className="input__public-page">
            <input
              type="search"
              placeholder="Search by anything"
              onChange={handleSearch}
              title="Search classrooms"
            />
            <FaMagnifyingGlass className="icon__public-page" />
          </div>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="triple-content__public-page">
          <h1 className="title__public-page">Unsubmited</h1>
          {assignments.length > 0
            ? filteredData
                ?.filter(
                  (item) =>
                    !item.submissions?.some((s) => s.student_uid === user?.uid)
                )
                .sort((a, b) => new Date(a.endAt) - new Date(b.endAt))
                .slice(0, 10)
                .map((item) => (
                  <AssignmentList key={item?.assignment_number} item={item} />
                ))
            : null}
        </div>
        <div className="triple-content__public-page">
          <h1 className="title__public-page">All Assignment</h1>
          {assignments.length > 0
            ? filteredData
                ?.sort((a, b) => new Date(a.endAt) - new Date(b.endAt))
                .slice(0, 10)
                .map((item) => (
                  <AssignmentList key={item?.assignment_number} item={item} />
                ))
            : null}
        </div>
        <div className="triple-content__public-page">
          <h1 className="title__public-page">Submited</h1>
          {assignments.length > 0
            ? filteredData
                ?.filter((item) =>
                  item.submissions?.some((s) => s.student_uid === user?.uid)
                )
                .sort((a, b) => new Date(a.endAt) - new Date(b.endAt))
                .slice(0, 10)
                .map((item) => (
                  <AssignmentList key={item?.assignment_number} item={item} />
                ))
            : null}
        </div>
      </div>
    </main>
  );
}
