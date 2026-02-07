export const toggleModal = (param) => {
  const closeModal = () => {
    setModal({ isActive: false });
  };

  const {
    mode = "field",
    type = "",
    title = "",
    message = "",
    isActive = false,
    isEdit = false,
    isDelete = false,
    isView = false,
    isVertical = false,
    fields = [],
    item = {},
    parentId = "",
    itemId = "",
    itemShow = "",
    onClose = closeModal,
    onAdd,
    onRemove,
    onSubmit,
    setModal,
  } = param;

  setModal({
    mode,
    type,
    title,
    message,
    isActive,
    isEdit,
    isDelete,
    isView,
    isVertical,
    fields,
    item,
    parentId,
    itemId,
    itemShow,
    onClose,
    onAdd,
    onRemove,
    onSubmit,
  });
};
