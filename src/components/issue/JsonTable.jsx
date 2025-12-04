const { memo } = wp.element;

const JsonTable = memo(({ data }) => {
  if (!data) return null;

  let parsedData;
  try {
    if (typeof data === 'string') {
      if (data === 'null') return null;
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    if (!parsedData || typeof parsedData !== 'object') {
      console.error('JsonTable: Invalid data format', parsedData);
      return <p>Invalid data format</p>;
    }
  } catch (e) {
    console.error('JsonTable: Error parsing JSON', e, data);
    return <p>Error parsing JSON data</p>;
  }

  return (
    <table
      className="alpaca-json-table widefat striped"
      style={{ borderCollapse: 'collapse', width: '100%' }}
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
