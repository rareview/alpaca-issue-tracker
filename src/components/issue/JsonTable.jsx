const { memo } = wp.element;

const JsonTable = memo(({ data }) => {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    return <p>Error parsing JSON data</p>;
  }

  return (
    <table
      className="alpaca-json-table widefat striped"
      style={{ borderCollapse: "collapse", width: "100%" }}
    >
      <tbody>
        {Object.entries(parsedData).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default JsonTable;
