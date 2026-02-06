import { FaMagnifyingGlass } from "react-icons/fa6";
import "../public.css";

import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getClassrooms } from "../../../_services/classrooms";
import ItemList from "../../../components/grid-item/ItemList";

export default function Materials() {
  const { switchLoading, setAllertSetting, state, userRole } =
    useOutletContext();

  const [user, setUser] = useState({});
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";

      try {
        switchLoading(true);

        const [userData] = await Promise.all([showUser(fixUser?.uid)]);

        const tempClassrooms =
          fixUser?.role === "Asisten"
            ? userData?.assists
            : userData?.classrooms;

        const fetchClassrooms =
          tempClassrooms?.map((c) => getClassrooms(c?.class_code)) || [];

        const classroomsData = await Promise.all(fetchClassrooms);

        console.log(classroomsData?.flat());

        setUser(userData);
        setMaterials(classroomsData?.flat());
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
    setMaterials(tempAssignments || []);
  }, [state]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = materials?.filter((item) => {
    const columnsToSearch = ["material_number", "title"];

    return columnsToSearch?.some((key) => {
      const value = item[key];

      if (value === null || value === undefined) return false;

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">Materials</h1>
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
        <ItemList
          title={"Materials"}
          items={filteredData}
          settings={{ id: "material_number", show: "title" }}
          span={2}
          link={`/${userRole}/classrooms/materials`}
        />
        <ItemList
          title={"Materials"}
          items={filteredData}
          settings={{ id: "material_number", show: "title" }}
          span={1}
          link={`/${userRole}/classrooms/materials`}
        />
      </div>
    </main>
  );
}
