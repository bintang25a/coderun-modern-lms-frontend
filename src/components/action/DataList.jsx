import { Link } from "react-router-dom";

const DataList = ({ item, settings }) => {
  const saveId = (id) => {
    localStorage.setItem([settings?.id], id);
  };

  return (
    <Link
      to={`${item[settings?.id]}`}
      className="data-list__action-component"
      onClick={() => saveId(item[settings?.id])}
    >
      <h2 title={item[settings?.show]} className="title-text__action-component">
        {`${item[settings?.show]} - [${item[settings?.id]}]`}
      </h2>
    </Link>
  );
};

export default DataList;

// assignment-list__public-page __assignments-assistant
