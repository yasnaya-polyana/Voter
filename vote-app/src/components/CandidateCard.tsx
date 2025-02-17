const CandidateCard = ({ candidate }) => {
  return (
    <div className="candidate-card">
      <img src={URL.createObjectURL(candidate.image)} alt={candidate.name} />
      <h3>{candidate.name}</h3>
      <p>{candidate.description}</p>
    </div>
  );
};

export default CandidateCard;

