export function sendData(res, data, status = 200) {
  return res.status(status).json({ data });
}

export function sendList(res, data, meta) {
  return res.json({ data, meta });
}
