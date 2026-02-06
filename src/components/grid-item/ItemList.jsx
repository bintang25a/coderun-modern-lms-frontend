import { Link } from "react-router-dom";

const ItemList = ({ title, items, settings, span = 1, disabled, link }) => {
  const saveId = (id) => {
    localStorage.setItem([settings?.id], id);
  };

  const Component = disabled ? "div" : Link;

  return (
    <div
      className={`item-list__grid-item-component width-${span}__grid-item-component`}
    >
      <h1 className="title__grid-item-component">{title}</h1>
      {items?.length > 0 ? (
        items?.map((item) => (
          <Component
            key={item[settings?.id]}
            to={`/${link}/${item[settings?.id]}`}
            className="item__grid-item-component"
            onClick={() => saveId(item[settings?.id])}
          >
            <h2
              title={item[settings?.show]}
              className="show__grid-item-component"
            >
              {`${item[settings?.show]} - [${item[settings?.id]}]`}
            </h2>
          </Component>
        ))
      ) : (
        <div className="item-null__grid-item-component">
          <h2 className="show__grid-item-component">No Data</h2>
        </div>
      )}
    </div>
  );
};

export default ItemList;
