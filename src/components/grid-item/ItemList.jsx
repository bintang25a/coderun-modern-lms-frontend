import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { Link } from "react-router-dom";

const ItemList = ({
  title,
  items,
  settings,
  span = { row: 3, col: 1 },
  disabled = false,
  link,
  onEdit,
  onDelete,
  onAction,
}) => {
  const isAction = !!onAction;

  const action = (id) => {
    localStorage.setItem([settings?.id], id);

    if (disabled && isAction) {
      onAction(id);
    }
  };

  const { row, col } = span;

  const Component = isAction ? "div" : disabled ? "button" : Link;

  return (
    <div
      className={`item-list__grid-item-component`}
      style={{
        gridRow: `span ${row}`,
        gridColumn: `span ${col}`,
      }}
    >
      <h1 className="title__grid-item-component">{title}</h1>
      {items?.length > 0 ? (
        items?.map((item) => (
          <Component
            key={item[settings?.id]}
            to={`/${link}/${item[settings?.id]}`}
            className="item__grid-item-component"
            onClick={() => action(item[settings?.id])}
            disabled={disabled && !isAction}
          >
            <h2
              title={item[settings?.show]}
              className="show__grid-item-component"
            >
              {`${item[settings?.show]} - [${item[settings?.id]}]`}
            </h2>
            {onEdit || onDelete ? (
              <div className="action__grid-item-component">
                {onEdit ? (
                  <button
                    className="button__grid-item-component"
                    title="Edit data"
                    onClick={(e) => onEdit(e, item[settings?.id])}
                  >
                    <AiOutlineEdit />
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    className="button__grid-item-component"
                    title="Delete data"
                    onClick={(e) => onDelete(e, item[settings?.id])}
                  >
                    <AiOutlineDelete />
                  </button>
                ) : null}
              </div>
            ) : null}
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
