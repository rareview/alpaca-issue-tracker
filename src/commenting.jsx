const AlpacaCommenting = () => {
  <div id="alpaca-comments" className="alpaca-grid">
    <div className="alpaca-row">
      <div className="alpaca-meta">
        <AlpacaUser />
      </div>
      <div className="alpaca-comment">
        <TextareaControl
          placeholder="Not implemented yet"
          id="alpaca-comment-textarea"
          value={""} // No comment input in this version
          onChange={() => {}}
          disabled={true} // Disable input for now
        />
        <Button isPrimary>Submit Comment</Button>
      </div>
    </div>

    <div className="alpaca-row">
      <div className="alpaca-meta">
        <div className="alpaca-author">Author</div>
      </div>
      <div className="alpaca-comment">Comment</div>
    </div>
  </div>;
};

export default AlpacaCommenting;
