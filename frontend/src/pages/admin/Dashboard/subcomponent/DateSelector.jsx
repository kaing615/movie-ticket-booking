import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DateSelection = ({ onSelection, value }) => {
  const handleChange = (dates, dateStrings) => {
    if (!dates || dates.length === 0) {
      const today = dayjs().format("YYYY-MM-DD");
      onSelection([today, today]);
    } else {
      onSelection(dateStrings);
    }
  };

  const pickerValue =
    value && value.length === 2 && value[0] && value[1]
      ? [dayjs(value[0]), dayjs(value[1])]
      : null;

  return (
    <RangePicker
      onChange={handleChange}
      value={pickerValue} // Pass the value prop to RangePicker
      disabledDate={(current) => {
        // Can not select dates after today
        return current && current > dayjs().endOf('day');
      }}
      format="YYYY-MM-DD" // Explicitly set format for consistency
    />
  );
};

export default DateSelection;