// ============================================================
// The Scorekeeper — state, rendering, interaction
// Stores everything in localStorage under a versioned key.
// ============================================================

const STORAGE_KEY = "scorekeeper:v1";
const ROMANS = ["I", "II", "III", "IV"];

// ----- persistence -------------------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { games: [], activeId: null };
    const parsed = JSON.parse(raw);
    return {
      games: Array.isArray(parsed.games) ? parsed.games : [],
      activeId: parsed.activeId ?? null,
    };
  } catch {
    return { games: [], activeId: null };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();

// ----- utilities ---------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtScore = (n) => (n > 0 ? `+${n}` : `${n}`);

const getGame = (id) => state.games.find((g) => g.id === id);

const totalsFor = (game) => {
  const totals = game.players.map(() => 0);
  for (const round of game.rounds) {
    round.scores.forEach((s, i) => (totals[i] += s));
  }
  return totals;
};

// Return an array of {playerIndex, total, rank} sorted by total desc
function rankings(game) {
  const totals = totalsFor(game);
  const indexed = totals.map((total, playerIndex) => ({ playerIndex, total }));
  indexed.sort((a, b) => b.total - a.total);

  // dense ranking so ties share a rank number
  let rank = 0;
  let prev = null;
  indexed.forEach((row, i) => {
    if (prev === null || row.total !== prev) {
      rank = i + 1;
      prev = row.total;
    }
    row.rank = rank;
  });
  return indexed;
}

// ----- DOM refs ----------------------------------------------
const els = {
  app: $("#app"),
  viewIndex: $("#view-index"),
  viewGame: $("#view-game"),
  gamesList: $("#games-list"),
  gamesEmpty: $("#games-empty"),

  gameHeading: $("#game-heading"),
  gameOpened: $("#game-opened"),
  gameCrumb: $("#game-crumb-name"),
  roundCount: $("#round-count"),
  leaderboard: $("#leaderboard"),
  roundForm: $("#round-form"),
  roundFields: $("#round-entry-fields"),
  roundsHead: $("#rounds-head"),
  roundsBody: $("#rounds-body"),
  roundsTotals: $("#rounds-totals"),
  roundsEmpty: $("#rounds-empty"),

  newGameDialog: $("#new-game-dialog"),
  newGameForm: $("#new-game-form"),
  newGameError: $("#new-game-error"),
  gameNameInput: $("#game-name-input"),

  renameDialog: $("#rename-dialog"),
  renameForm: $("#rename-form"),
  renameInput: $("#rename-input"),

  confirmDialog: $("#confirm-dialog"),
  confirmForm: $("#confirm-form"),
  confirmBody: $("#confirm-body"),

  todayLabel: $("#today-label"),
};

// ----- masthead date -----------------------------------------
els.todayLabel.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

// ----- rendering ---------------------------------------------
function render() {
  if (state.activeId && getGame(state.activeId)) {
    renderGameView();
    els.viewIndex.hidden = true;
    els.viewGame.hidden = false;
  } else {
    state.activeId = null;
    renderIndex();
    els.viewIndex.hidden = false;
    els.viewGame.hidden = true;
  }
  saveState();
}

function renderIndex() {
  const sorted = [...state.games].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  els.gamesEmpty.hidden = sorted.length > 0;
  els.gamesList.innerHTML = "";

  for (const game of sorted) {
    const totals = totalsFor(game);
    const ranked = rankings(game);
    const leaderIdx = ranked[0]?.playerIndex ?? 0;
    const hasScores = game.rounds.length > 0;

    const li = document.createElement("li");
    li.innerHTML = `
      <button class="game-card" type="button" data-game-id="${game.id}">
        <div class="game-card__head">
          <span class="game-card__name"></span>
          <span class="game-card__date"></span>
        </div>
        <div class="game-card__players"></div>
        <div class="game-card__foot">
          <span><span class="rounds-count"></span> rounds</span>
          <strong class="leader-score"></strong>
        </div>
      </button>
    `;
    li.querySelector(".game-card__name").textContent = game.name;
    li.querySelector(".game-card__date").textContent = fmtDate(game.createdAt);
    li.querySelector(".rounds-count").textContent = game.rounds.length;

    const playerWrap = li.querySelector(".game-card__players");
    game.players.forEach((p, i) => {
      const chip = document.createElement("span");
      chip.className = "chip" + (hasScores && i === leaderIdx ? " chip--leader" : "");
      chip.textContent = p;
      playerWrap.appendChild(chip);
    });

    const leaderLine = li.querySelector(".leader-score");
    if (hasScores) {
      leaderLine.textContent = `${game.players[leaderIdx]} · ${fmtScore(
        totals[leaderIdx]
      )}`;
    } else {
      leaderLine.textContent = "no scores yet";
      leaderLine.style.color = "var(--ink-3)";
      leaderLine.style.fontStyle = "italic";
    }

    els.gamesList.appendChild(li);
  }
}

function renderGameView() {
  const game = getGame(state.activeId);
  if (!game) return;

  els.gameHeading.textContent = game.name;
  els.gameCrumb.textContent = game.name;
  els.gameOpened.textContent = fmtDate(game.createdAt);
  els.roundCount.textContent = game.rounds.length;

  renderLeaderboard(game);
  renderRoundEntry(game);
  renderRoundsTable(game);
}

function renderLeaderboard(game) {
  const totals = totalsFor(game);
  const ranked = rankings(game);
  const maxAbs = Math.max(1, ...totals.map((t) => Math.abs(t)));

  // capture previous rank positions for FLIP-like effect
  const prevPositions = new Map();
  $$(".rank", els.leaderboard).forEach((node) => {
    prevPositions.set(node.dataset.playerIndex, node.getBoundingClientRect().top);
  });

  els.leaderboard.innerHTML = "";

  ranked.forEach((row) => {
    const { playerIndex, total, rank } = row;
    const name = game.players[playerIndex];
    const lastRound = game.rounds.at(-1);
    const lastDelta = lastRound ? lastRound.scores[playerIndex] : null;
    const barWidth = Math.max(0, (total / maxAbs) * 100);

    const li = document.createElement("li");
    li.className = `rank rank--${rank}`;
    li.dataset.playerIndex = playerIndex;
    li.innerHTML = `
      <span class="rank__numeral"></span>
      <div class="rank__body">
        <span class="rank__name"></span>
        <span class="rank__score"></span>
        <span class="rank__bar" style="width: 0%"></span>
        <div class="rank__meta">
          <span class="rank__seat"></span>
          <span class="rank__delta"></span>
        </div>
      </div>
    `;
    li.querySelector(".rank__numeral").textContent = rank;
    li.querySelector(".rank__name").textContent = name;
    li.querySelector(".rank__name").title = name;
    li.querySelector(".rank__seat").textContent = `Seat ${ROMANS[playerIndex]}`;
    li.querySelector(".rank__score").textContent = fmtScore(total);
    li.querySelector(".rank__delta").textContent =
      lastDelta === null ? "—" : `last round ${fmtScore(lastDelta)}`;

    els.leaderboard.appendChild(li);

    // animate bar
    requestAnimationFrame(() => {
      li.querySelector(".rank__bar").style.width = `${Math.min(100, Math.max(0, barWidth))}%`;
    });
  });

  // FLIP — animate row-reorder
  $$(".rank", els.leaderboard).forEach((node) => {
    const prev = prevPositions.get(node.dataset.playerIndex);
    if (prev === undefined) return;
    const next = node.getBoundingClientRect().top;
    const delta = prev - next;
    if (Math.abs(delta) > 2) {
      node.animate(
        [
          { transform: `translateY(${delta}px)` },
          { transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
      );
    }
  });
}

function renderRoundEntry(game) {
  els.roundFields.innerHTML = "";
  game.players.forEach((name, i) => {
    const field = document.createElement("div");
    field.className = "round-entry__field";
    field.innerHTML = `
      <label for="score-${i}"><span class="roman">${ROMANS[i]}</span><span class="player-name"></span></label>
      <input
        id="score-${i}"
        name="score-${i}"
        data-player-index="${i}"
        type="number"
        inputmode="numeric"
        step="1"
        placeholder="0"
        autocomplete="off"
      />
    `;
    field.querySelector(".player-name").textContent = name;
    els.roundFields.appendChild(field);
  });
}

function renderRoundsTable(game) {
  // header
  els.roundsHead.innerHTML = "";
  const thRound = document.createElement("th");
  thRound.textContent = "Round";
  els.roundsHead.appendChild(thRound);
  game.players.forEach((p) => {
    const th = document.createElement("th");
    th.textContent = p;
    els.roundsHead.appendChild(th);
  });
  const thActions = document.createElement("th");
  thActions.setAttribute("aria-label", "Actions");
  els.roundsHead.appendChild(thActions);

  // body
  els.roundsBody.innerHTML = "";
  els.roundsEmpty.hidden = game.rounds.length > 0;

  game.rounds.forEach((round, i) => {
    const tr = document.createElement("tr");

    const tdNum = document.createElement("td");
    tdNum.textContent = `No. ${i + 1}`;
    tr.appendChild(tdNum);

    round.scores.forEach((s) => {
      const td = document.createElement("td");
      const cls = s > 0 ? "pos" : s < 0 ? "neg" : "zero";
      td.className = `score-cell ${cls}`;
      td.textContent = fmtScore(s);
      tr.appendChild(td);
    });

    const tdAct = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "row-delete";
    del.textContent = "Remove";
    del.dataset.roundId = round.id;
    tdAct.appendChild(del);
    tr.appendChild(tdAct);

    els.roundsBody.appendChild(tr);
  });

  // totals
  els.roundsTotals.innerHTML = "";
  const totals = totalsFor(game);
  const maxVal = Math.max(...totals);

  const tdLabel = document.createElement("td");
  tdLabel.textContent = "Total";
  els.roundsTotals.appendChild(tdLabel);

  totals.forEach((t) => {
    const td = document.createElement("td");
    td.textContent = fmtScore(t);
    if (totals.length && t === maxVal && game.rounds.length > 0) {
      td.classList.add("is-leader");
    }
    if (t < 0) td.style.color = "var(--bordeaux-deep)";
    els.roundsTotals.appendChild(td);
  });

  const tdPad = document.createElement("td");
  els.roundsTotals.appendChild(tdPad);
}

// ----- actions -----------------------------------------------
function openNewGameDialog() {
  els.newGameForm.reset();
  els.newGameError.hidden = true;
  els.newGameError.textContent = "";
  els.newGameDialog.showModal();
  setTimeout(() => els.gameNameInput.focus(), 40);
}

function createGame(fd) {
  const name = (fd.get("game-name") || "").toString().trim();
  const players = [1, 2, 3, 4].map((i) =>
    (fd.get(`p${i}`) || "").toString().trim()
  );

  if (!name) return "Give the game a name.";
  if (players.some((p) => !p)) return "All four seats need a name.";
  const lower = players.map((p) => p.toLowerCase());
  if (new Set(lower).size !== 4) return "Players must have distinct names.";

  const game = {
    id: uid(),
    name,
    createdAt: new Date().toISOString(),
    players,
    rounds: [],
  };
  state.games.push(game);
  state.activeId = game.id;
  return null;
}

function recordRound(e) {
  e.preventDefault();
  const game = getGame(state.activeId);
  if (!game) return;

  const inputs = $$("input[data-player-index]", els.roundFields);
  const scores = inputs.map((input) => {
    const v = input.value.trim();
    if (v === "" || v === "-" || v === "+") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  });

  const allZero = scores.every((s) => s === 0);
  const allBlank = inputs.every((i) => i.value.trim() === "");
  if (allBlank) {
    inputs[0].focus();
    return;
  }
  if (allZero) {
    // still record a zero round if they explicitly entered zeros — harmless
  }

  game.rounds.push({ id: uid(), scores });
  inputs.forEach((i) => (i.value = ""));
  render();
  inputs[0].focus();
}

function deleteRound(roundId) {
  const game = getGame(state.activeId);
  if (!game) return;
  game.rounds = game.rounds.filter((r) => r.id !== roundId);
  render();
}

function deleteGame(id) {
  state.games = state.games.filter((g) => g.id !== id);
  if (state.activeId === id) state.activeId = null;
  render();
}

function renameGame(newName) {
  const game = getGame(state.activeId);
  if (!game) return;
  game.name = newName.trim() || game.name;
  render();
}

// generic confirm dialog (Promise-based)
function confirmAction(text) {
  return new Promise((resolve) => {
    els.confirmBody.textContent = text;
    const form = els.confirmForm;
    const onCancel = () => {
      els.confirmDialog.close();
      cleanup();
      resolve(false);
    };
    const onSubmit = (e) => {
      e.preventDefault();
      els.confirmDialog.close();
      cleanup();
      resolve(true);
    };
    const cancelBtn = $('[data-action="cancel-confirm"]', form);
    function cleanup() {
      form.removeEventListener("submit", onSubmit);
      cancelBtn.removeEventListener("click", onCancel);
    }
    form.addEventListener("submit", onSubmit);
    cancelBtn.addEventListener("click", onCancel);
    els.confirmDialog.showModal();
  });
}

function exportAll() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scorekeeper-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function resetAll() {
  const ok = await confirmAction(
    "This clears every game in the book from this browser."
  );
  if (!ok) return;
  state.games = [];
  state.activeId = null;
  render();
}

// ----- event wiring ------------------------------------------
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action], [data-game-id], .row-delete");
  if (!target) return;

  if (target.classList.contains("row-delete")) {
    deleteRound(target.dataset.roundId);
    return;
  }

  if (target.dataset.gameId) {
    state.activeId = target.dataset.gameId;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const action = target.dataset.action;
  switch (action) {
    case "open-new-game":
      openNewGameDialog();
      break;
    case "cancel-new-game":
      els.newGameDialog.close();
      break;
    case "back-to-index":
      state.activeId = null;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "rename-game": {
      const game = getGame(state.activeId);
      if (!game) break;
      els.renameInput.value = game.name;
      els.renameDialog.showModal();
      setTimeout(() => els.renameInput.select(), 40);
      break;
    }
    case "cancel-rename":
      els.renameDialog.close();
      break;
    case "delete-game": {
      const game = getGame(state.activeId);
      if (!game) break;
      confirmAction(`Remove "${game.name}" and all its rounds?`).then((ok) => {
        if (ok) deleteGame(game.id);
      });
      break;
    }
    case "clear-entry": {
      $$("input[data-player-index]", els.roundFields).forEach(
        (i) => (i.value = "")
      );
      $$("input[data-player-index]", els.roundFields)[0]?.focus();
      break;
    }
    case "export-all":
      exportAll();
      break;
    case "reset-all":
      resetAll();
      break;
  }
});

els.newGameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(els.newGameForm);
  const err = createGame(fd);
  if (err) {
    els.newGameError.textContent = err;
    els.newGameError.hidden = false;
    return;
  }
  els.newGameDialog.close();
  render();
});

els.renameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  renameGame(els.renameInput.value);
  els.renameDialog.close();
});

els.roundForm.addEventListener("submit", recordRound);

// Close dialogs on backdrop click — only when the click lands on the
// dialog element itself (the backdrop), not on any descendant.
for (const dialog of [els.newGameDialog, els.renameDialog, els.confirmDialog]) {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
}

// ----- first paint -------------------------------------------
render();
