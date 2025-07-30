const MetricCard = ({ title, stat }) => {
    return (
        <div className="justify-items-center mb-4">
            <div className="flex flex-col items-center py-7">
                <p className="text-2xl m-0">{stat}</p>
                <p className="text-lg text-gray-500 m-0 mt-3">{title}</p>
            </div>
        </div>
    );
}

export default MetricCard