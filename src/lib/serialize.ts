// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPlain(doc: any) {
  if (!doc) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  if (obj.user_id) {
    obj.user_id = obj.user_id.toString();
  }
  if (obj.account_id) {
    obj.account_id = obj.account_id.toString();
  }
  if (obj.destination_account_id) {
    obj.destination_account_id = obj.destination_account_id.toString();
  }
  if (obj.category_id) {
    obj.category_id = obj.category_id.toString();
  }
  delete obj._id;
  delete obj.__v;
  return obj;
}

