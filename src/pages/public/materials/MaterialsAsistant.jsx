import { FaBookOpen, FaClipboardList } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createMaterial, getMaterials } from "../../../_services/materials";
import { showClassroom } from "../../../_services/classrooms";
import BlankGrid from "../../../components/container/BlankGrid";
import ManageDataField from "../../../components/action/ManageDataField";
import ManageDataTransfer from "../../../components/action/ManageDataTransfer";
import "../public.css";
import {
  createClassMaterial,
  deleteClassMaterial,
} from "../../../_services/materialClassroom";

export default function MaterialsAssistant() {
  const { switchLoading, setAllertSetting, refreshData, state, userRole } =
    useOutletContext();

  const navigate = useNavigate();

  const [classroom, setClassroom] = useState({});
  const [materials, setMaterials] = useState([]);
  const [classMaterials, setClassMaterials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const class_code = localStorage.getItem("class_code");

      try {
        switchLoading(true);

        const [classroomsData, materialsData] = await Promise.all([
          showClassroom(class_code),
          getMaterials(),
        ]);

        const classMaterialsData = classroomsData?.materials;

        setClassroom(classroomsData);
        setMaterials(materialsData);
        setClassMaterials(classMaterialsData);
      } catch (error) {
        console.log("Fetch error:", error);

        setAllertSetting({
          isActive: true,
          message: error,
        });
      } finally {
        setTimeout(() => switchLoading(false), 100);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // const tempuser = state?.data || {};
    // const class_code = localStorage.getItem("class_code");
    // const tempClassroom = tempuser?.assists?.find(
    //   (classroom) => classroom?.class_code === class_code
    // );
    // const tempAssignments = tempClassroom?.assignments;
    // setClassroom(tempClassroom);
    // setAssignments(tempAssignments);
  }, [state]);

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
                className="button__public-page active"
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
        <BlankGrid span={1}>
          <ManageDataField
            title={"UPLOAD MATERIAL"}
            message={"Upload material success"}
            fields={[
              {
                name: "title",
                label: "Title",
                placeholder: "Queue and Stack",
              },
              {
                name: "material",
                label: "Upload Material",
                type: "file",
              },
            ]}
            item_id={"material_number"}
            onSubmit={createMaterial}
            isVertical={true}
            loadingSetting={switchLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
          />
        </BlankGrid>
        <BlankGrid span={2}>
          <ManageDataTransfer
            title={"Material"}
            parent_id={classroom?.class_code}
            item_id={"material_number"}
            item_show={"title"}
            inBoxItems={classMaterials}
            outBoxItems={materials}
            onAdd={createClassMaterial}
            onRemove={deleteClassMaterial}
            onClose={() =>
              navigate(`/${userRole}/classrooms/${classroom?.class_code}`)
            }
            loadingSetting={switchLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
          />
        </BlankGrid>
      </div>
    </main>
  );
}
