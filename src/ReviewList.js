import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import "./RestaurantDetails.css";
import "./ReviewAnimations.css"; 

function ReviewList({ recenzii }) {
  const [sortBy, setSortBy] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 3;

  const filteredAndSorted = useMemo(() => {
    let result = [...recenzii];

    if (sortBy === "date") {
      result.sort((a, b) => (b.dataRecenzie?.seconds || 0) - (a.dataRecenzie?.seconds || 0));
    } else if (sortBy === "rating_desc") {
      result.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "rating_asc") {
      result.sort((a, b) => Number(a.rating) - Number(b.rating));
    }

    return result;
  }, [recenzii, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / perPage);
  const paginated = filteredAndSorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleChangePage = (dir) => {
    setCurrentPage(p => Math.min(Math.max(1, p + dir), totalPages));
  };

  return (
    <div className="review-controls-wrapper">
      <div className="review-filters">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-dropdown"
        >
          <option value="none">🔀 Sortare: implicită</option>
          <option value="date">🆕 Cele mai noi</option>
          <option value="rating_desc">⬇️ Rating descrescător</option>
          <option value="rating_asc">⬆️ Rating crescător</option>
        </select>
      </div>

      <div className="review-list fade-group">
        {paginated.length === 0 ? (
          <p style={{ padding: 20 }}>❗ Nu există recenzii.</p>
        ) : (
          paginated.map((rev) => (
            <div key={rev.id} className="review-card fade-in">
              <p>
                <strong>{rev.numeUser}</strong> (
                {format(new Date(rev.dataRecenzie?.seconds * 1000), "dd/MM/yyyy")})
              </p>
              <p>Rating: {"⭐".repeat(Number(rev.rating))}</p>
              {rev.comentariu && (
                <p style={{ fontStyle: "italic" }}>"{rev.comentariu}"</p>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={() => handleChangePage(-1)} disabled={currentPage === 1}>
            {"<"}
          </button>
          <span> Pagina {currentPage} / {totalPages} </span>
          <button onClick={() => handleChangePage(1)} disabled={currentPage === totalPages}>
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
