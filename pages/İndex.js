<div className="loading-spinner">
    <Spinner />
</div>
<div className="result-section">
    <h2>Results</h2>
    <div className="character-sections">
        {characters.map(character => (
            <Character key={character.id} character={character} />
        ))}
    </div>
</div>