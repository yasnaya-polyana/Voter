const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-xl">You do not have permission to access this page.</p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

