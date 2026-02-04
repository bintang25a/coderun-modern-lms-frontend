import "../public.css";
import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { showClassroom } from "../../../_services/classrooms";
import { formatDate } from "../../../_utilities/formatDate";
import { FaClipboard, FaClipboardCheck, FaClock } from "react-icons/fa6";

const MaterialList = ({ item }) => {
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const userRole = pathParts[0];

  return (
    <Link
      to={`/${userRole}/materials/${item?.material_number}`}
      className="assignment-list__public-page"
    >
      <h2 title={item?.title} className="title-text__public-page">
        {item?.title}
      </h2>
      <div className="text-container__public-page">
        <p
          title={`ID: ${item?.material_number}`}
          className="text-top__public-page"
        >
          ID: {item?.material_number}
        </p>
        <p
          title={`Upload at: ${formatDate(item?.createdAt)}`}
          className="text-bottom__public-page"
        >
          Upload at: {formatDate(item?.createdAt)}
        </p>
      </div>
    </Link>
  );
};

const AssignmentList = ({ item, uid }) => {
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const userRole = pathParts[0];

  const submissions = item?.assignments?.submissions || [];
  const userSubmission = submissions?.find((s) => s.student_uid === uid);

  const isSubmit = !!userSubmission;
  const isLate = isSubmit
    ? new Date(userSubmission.createdAt) > new Date(item?.endAt)
    : false;

  return (
    <Link
      to={`/${userRole}/assignments/${item?.assignment_number}`}
      className={`assignment-list__public-page ${isSubmit ? "submited" : ""}`}
    >
      <h2 title={item?.title} className="title-text__public-page">
        {item?.title}
      </h2>
      <div className="text-container__public-page">
        <p
          title={`Class: ${item?.class_code} / Uploaded by: ${item?.assistant?.name}`}
          className="text-top__public-page"
        >
          Uploaded by: {item?.assistant?.name}
        </p>
        <p
          title={`Due date: ${formatDate(item?.endAt)}`}
          className="text-bottom__public-page"
        >
          Due date: {formatDate(item?.endAt)}
        </p>
      </div>
      <div className="sign__public-page">
        {isLate ? (
          <FaClock className="icon__public-page" />
        ) : isSubmit ? (
          <FaClipboardCheck className="icon__public-page" />
        ) : (
          <FaClipboard className="icon__public-page" />
        )}
      </div>
    </Link>
  );
};

const StudentList = ({ item }) => {
  return (
    <div className="student-list__public-page">
      <h2
        title={`${item?.uid} - ${item?.name}`}
        className="title-text__public-page"
      >
        {`${item?.uid} - ${item?.name}`}
      </h2>
    </div>
  );
};

export default function Classroom() {
  const { switchLoading, setAllertSetting, state } = useOutletContext();

  const { id } = useParams();

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
          showClassroom(id),
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
          <h1 className="title__public-page">
            Tutor/Asisten:
            <span> {classroom?.assistants?.map((a) => a?.name).join("/")}</span>
          </h1>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="triple-content__public-page">
          <h1 className="title__public-page">
            <span>Materials: </span>
            {classroom?.materials?.length}
          </h1>
          {classroom?.materials?.length > 0 ? (
            classroom?.materials?.map((item) => (
              <MaterialList key={item.material_number} item={item} />
            ))
          ) : (
            <div className="student-list__public-page">
              No Material Uploaded
            </div>
          )}
        </div>
        <div className="triple-content__public-page">
          <h1 className="title__public-page">
            <span>Assignments: </span>
            {classroom?.assignments?.length}
          </h1>
          {classroom?.assignments?.length > 0 ? (
            classroom?.assignments?.map((item) => (
              <AssignmentList
                key={item.assignment_number}
                item={item}
                uid={user?.uid}
              />
            ))
          ) : (
            <div className="student-list__public-page">
              No Material Uploaded
            </div>
          )}
        </div>
        <div className="triple-content__public-page">
          <h1 className="title__public-page">
            <span>Students: </span>
            {classroom?.students?.length}
          </h1>
          {classroom?.students?.length > 0 ? (
            classroom?.students?.map((item) => (
              <StudentList key={item?.uid} item={item} />
            ))
          ) : (
            <div className="student-list__public-page">
              No Material Uploaded
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
