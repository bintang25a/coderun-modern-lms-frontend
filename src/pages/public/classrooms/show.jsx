import "../public.css";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { showClassroom } from "../../../_services/classrooms";
import { FaBookOpen, FaClipboardList } from "react-icons/fa6";
import ItemList from "../../../components/grid-item/ItemList";
import { fileMaterial } from "../../../_services/materials";

export default function Classroom() {
  const { switchLoading, setAllertSetting, state, userRole } =
    useOutletContext();

  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        switchLoading(true);

        const [classroomData] = await Promise.all([showClassroom(id)]);

        localStorage.setItem("class_code", classroomData?.class_code);

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
    setClassroom(state?.classroom || {});
  }, [state]);

  const handleAction = async (id) => {
    const file = await fileMaterial(id);

    localStorage.setItem("blob", file);

    navigate(`/${userRole}/classrooms/materials`);
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <Link
            to={`/${userRole}/classrooms/${classroom?.class_code}`}
            className="title__public-page"
          >
            {classroom?.name}
          </Link>
        </section>

        <section className="right__public-page">
          {userRole === "assistant" ? (
            <div className="action__public-page">
              <Link
                to={`/${userRole}/classrooms/materials`}
                className="button__public-page"
              >
                <FaBookOpen /> Materials
              </Link>
              <Link
                to={`/${userRole}/classrooms/assignments`}
                className="button__public-page"
              >
                <FaClipboardList /> Assignments
              </Link>
            </div>
          ) : (
            <h1 className="title__public-page">
              Tutor/Asisten:{" "}
              <span>
                {classroom?.assistants?.map((a) => a?.name).join("/")}
              </span>
            </h1>
          )}
        </section>
      </nav>
      <div className="content-container__public-page">
        <ItemList
          title={`Materials: ${classroom?.materials?.length}`}
          items={classroom?.materials}
          settings={{ id: "material_number", show: "title" }}
          link={`${userRole}/classrooms/materials`}
          disabled={true}
          onAction={handleAction}
        />
        <ItemList
          title={`Assignments: ${classroom?.assignments?.length}`}
          items={classroom?.assignments}
          settings={{ id: "assignment_number", show: "title" }}
          link={`${userRole}/classrooms/assignments`}
          disabled={false}
        />
        <ItemList
          title={`Students: ${classroom?.students?.length}`}
          items={classroom?.students}
          settings={{ id: "uid", show: "name" }}
          disabled={true}
        />
      </div>
    </main>
  );
}
