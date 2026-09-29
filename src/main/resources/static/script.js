
const API_BASE_URL = "";

// Data received from the backend
let books = [];
let members = [];
let borrowRecords = [];

let messageTimer;

// Display a temporary success or error message
function showMessage(message, type = "success") {
    const messageBox = document.getElementById("message");

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.hidden = false;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(function () {
        messageBox.hidden = true;
    }, 3500);
}

// Send a request to the Spring Boot backend
async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || `Request failed with status ${response.status}`
        );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

// Load all data
async function refreshAll() {
    try {
        const results = await Promise.all([
            apiRequest("/books"),
            apiRequest("/members"),
            apiRequest("/borrow-records")
        ]);

        books = results[0];
        members = results[1];
        borrowRecords = results[2];

        updateDashboard();
        renderBooks();
        renderMembers();
        renderBorrowRecords();
        populateBorrowOptions();

        console.log("Library data loaded successfully.");
    } catch (error) {
        console.error("Loading error:", error);

        showMessage(
            "Could not load data. Check that Spring Boot is running.",
            "error"
        );
    }
}

// Update dashboard totals
function updateDashboard() {
    document.getElementById("total-books").textContent = books.length;
    document.getElementById("total-members").textContent = members.length;

    document.getElementById("total-borrow-records").textContent =
        borrowRecords.length;

    document.getElementById("books-count").textContent =
        `${books.length} books`;

    document.getElementById("members-count").textContent =
        `${members.length} members`;

    document.getElementById("records-count").textContent =
        `${borrowRecords.length} records`;
}

// Create a table cell safely
function createCell(value) {
    const cell = document.createElement("td");

    cell.textContent =
        value === null || value === undefined || value === ""
            ? "—"
            : value;

    return cell;
}

// Create an action button
function createActionButton(label, action, id, className) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = `btn ${className}`;
    button.dataset.action = action;
    button.dataset.id = id;

    return button;
}

// Create an actions cell for books and members
function createActionsCell(id, type) {
    const cell = document.createElement("td");
    const wrapper = document.createElement("div");

    wrapper.className = "action-buttons";

    if (type === "book") {
        wrapper.appendChild(
            createActionButton("Edit", "edit-book", id, "btn-edit")
        );

        wrapper.appendChild(
            createActionButton("Delete", "delete-book", id, "btn-delete")
        );
    }

    if (type === "member") {
        wrapper.appendChild(
            createActionButton("Edit", "edit-member", id, "btn-edit")
        );

        wrapper.appendChild(
            createActionButton("Delete", "delete-member", id, "btn-delete")
        );
    }

    cell.appendChild(wrapper);

    return cell;
}

// Render the books table
function renderBooks() {
    const tableBody = document.getElementById("books-table-body");

    const search = document.getElementById("book-search")
        .value.trim().toLowerCase();

    tableBody.replaceChildren();

    const filteredBooks = books.filter(function (book) {
        return [
            book.id,
            book.name,
            book.author
        ].some(function (value) {
            return String(value ?? "").toLowerCase().includes(search);
        });
    });

    if (filteredBooks.length === 0) {
        const row = document.createElement("tr");
        const cell = createCell(
            search ? "No matching books found." : "No books found."
        );

        cell.colSpan = 4;
        cell.className = "empty-state";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    filteredBooks.forEach(function (book) {
        const row = document.createElement("tr");

        row.appendChild(createCell(book.id));
        row.appendChild(createCell(book.name));
        row.appendChild(createCell(book.author));

        const actionsCell = createActionsCell(book.id, "book");
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Reset the book form
function resetBookForm() {
    document.getElementById("book-form").reset();
    document.getElementById("book-id").value = "";

    document.getElementById("book-form-title").textContent =
        "Add a new book";

    document.getElementById("book-submit-btn").textContent =
        "+ Add Book";

    document.getElementById("book-cancel-btn").hidden = true;
}

// Add or update a book
document.getElementById("book-form").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const id = document.getElementById("book-id").value;

        const book = {
            name: document.getElementById("book-name").value.trim(),
            author: document.getElementById("book-author").value.trim()
        };

        if (!book.name || !book.author) {
            showMessage(
                "Please enter both the book name and author.",
                "error"
            );
            return;
        }

        try {
            await apiRequest(
                id ? `/books/${id}` : "/books",
                {
                    method: id ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(book)
                }
            );

            resetBookForm();
            await refreshAll();

            showMessage(
                id
                    ? "Book updated successfully."
                    : "Book added successfully."
            );
        } catch (error) {
            console.error("Book save error:", error);

            showMessage(
                error.message || "Could not save the book.",
                "error"
            );
        }
    }
);

// Prepare a book for editing
function editBook(id) {
    const book = books.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!book) return;

    document.getElementById("book-id").value = book.id;
    document.getElementById("book-name").value = book.name || "";
    document.getElementById("book-author").value = book.author || "";

    document.getElementById("book-form-title").textContent = "Edit book";
    document.getElementById("book-submit-btn").textContent = "Save Changes";
    document.getElementById("book-cancel-btn").hidden = false;

    document.getElementById("books").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("book-name").focus();
}

// Delete a book
async function deleteBook(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
        await apiRequest(`/books/${id}`, {
            method: "DELETE"
        });

        await refreshAll();
        showMessage("Book deleted successfully.");
    } catch (error) {
        console.error("Book deletion error:", error);

        showMessage(
            "Could not delete the book. It may be linked to a borrow record.",
            "error"
        );
    }
}

// Render the members table
function renderMembers() {
    const tableBody = document.getElementById("members-table-body");

    const search = document.getElementById("member-search")
        .value.trim().toLowerCase();

    tableBody.replaceChildren();

    const filteredMembers = members.filter(function (member) {
        return [
            member.id,
            member.name,
            member.email,
            member.phone
        ].some(function (value) {
            return String(value ?? "").toLowerCase().includes(search);
        });
    });

    if (filteredMembers.length === 0) {
        const row = document.createElement("tr");
        const cell = createCell(
            search ? "No matching members found." : "No members found."
        );

        cell.colSpan = 5;
        cell.className = "empty-state";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    filteredMembers.forEach(function (member) {
        const row = document.createElement("tr");

        row.appendChild(createCell(member.id));
        row.appendChild(createCell(member.name));
        row.appendChild(createCell(member.email));
        row.appendChild(createCell(member.phone));
        row.appendChild(createActionsCell(member.id, "member"));

        tableBody.appendChild(row);
    });
}

// Reset the member form
function resetMemberForm() {
    document.getElementById("member-form").reset();
    document.getElementById("member-id").value = "";

    document.getElementById("member-form-title").textContent =
        "Register a member";

    document.getElementById("member-submit-btn").textContent =
        "+ Add Member";

    document.getElementById("member-cancel-btn").hidden = true;
}

// Add or update a member
document.getElementById("member-form").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const id = document.getElementById("member-id").value;

        const member = {
            name: document.getElementById("member-name").value.trim(),
            email: document.getElementById("member-email").value.trim(),
            phone: document.getElementById("member-phone").value.trim()
        };

        if (!member.name || !member.email) {
            showMessage(
                "Please enter the member name and email.",
                "error"
            );
            return;
        }

        try {
            await apiRequest(
                id ? `/members/${id}` : "/members",
                {
                    method: id ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(member)
                }
            );

            resetMemberForm();
            await refreshAll();

            showMessage(
                id
                    ? "Member updated successfully."
                    : "Member registered successfully."
            );
        } catch (error) {
            console.error("Member save error:", error);

            showMessage(
                error.message || "Could not save the member.",
                "error"
            );
        }
    }
);

// Prepare a member for editing
function editMember(id) {
    const member = members.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!member) return;

    document.getElementById("member-id").value = member.id;
    document.getElementById("member-name").value = member.name || "";
    document.getElementById("member-email").value = member.email || "";
    document.getElementById("member-phone").value = member.phone || "";

    document.getElementById("member-form-title").textContent = "Edit member";
    document.getElementById("member-submit-btn").textContent = "Save Changes";
    document.getElementById("member-cancel-btn").hidden = false;

    document.getElementById("members").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("member-name").focus();
}

// Delete a member
async function deleteMember(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {
        await apiRequest(`/members/${id}`, {
            method: "DELETE"
        });

        await refreshAll();
        showMessage("Member deleted successfully.");
    } catch (error) {
        console.error("Member deletion error:", error);

        showMessage(
            "Could not delete the member. They may have borrow records.",
            "error"
        );
    }
}

// Populate book and member dropdowns
function populateBorrowOptions() {
    const bookSelect = document.getElementById("borrow-book");
    const memberSelect = document.getElementById("borrow-member");

    const previousBook = bookSelect.value;
    const previousMember = memberSelect.value;

    bookSelect.replaceChildren();
    memberSelect.replaceChildren();

    const bookPlaceholder = document.createElement("option");
    bookPlaceholder.value = "";
    bookPlaceholder.textContent = "Choose a book";
    bookSelect.appendChild(bookPlaceholder);

    books.forEach(function (book) {
        const option = document.createElement("option");

        option.value = book.id;
        option.textContent = `${book.name} (ID: ${book.id})`;

        bookSelect.appendChild(option);
    });

    const memberPlaceholder = document.createElement("option");
    memberPlaceholder.value = "";
    memberPlaceholder.textContent = "Choose a member";
    memberSelect.appendChild(memberPlaceholder);

    members.forEach(function (member) {
        const option = document.createElement("option");

        option.value = member.id;
        option.textContent = `${member.name} (ID: ${member.id})`;

        memberSelect.appendChild(option);
    });

    if (books.some(book => String(book.id) === previousBook)) {
        bookSelect.value = previousBook;
    }

    if (members.some(member => String(member.id) === previousMember)) {
        memberSelect.value = previousMember;
    }
}

// Format a date for display
function formatDate(date) {
    if (!date) return "—";

    const parts = String(date).split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Render the borrow records table
function renderBorrowRecords() {
    const tableBody = document.getElementById(
        "borrow-records-table-body"
    );

    const search = document.getElementById("borrow-search")
        .value.trim().toLowerCase();

    tableBody.replaceChildren();

    const filteredRecords = borrowRecords.filter(function (record) {
        const searchableText = [
            record.id,
            record.book?.id,
            record.book?.name,
            record.member?.id,
            record.member?.name,
            record.issueDate,
            record.returnDate,
            record.returned ? "returned" : "not returned"
        ].join(" ").toLowerCase();

        return searchableText.includes(search);
    });

    if (filteredRecords.length === 0) {
        const row = document.createElement("tr");

        const cell = createCell(
            search
                ? "No matching borrow records found."
                : "No borrow records found."
        );

        cell.colSpan = 7;
        cell.className = "empty-state";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    filteredRecords.forEach(function (record) {
        const row = document.createElement("tr");

        row.appendChild(createCell(record.id));
        row.appendChild(createCell(record.book?.name));
        row.appendChild(createCell(record.member?.name));
        row.appendChild(createCell(formatDate(record.issueDate)));
        row.appendChild(createCell(formatDate(record.returnDate)));

        // Return status
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        if (record.returned === true) {
            statusBadge.className = "return-status returned";
            statusBadge.textContent = "✓ Returned";
        } else {
            statusBadge.className = "return-status not-returned";
            statusBadge.textContent = "Not Returned";
        }

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Action buttons
        const actionsCell = document.createElement("td");
        const actionsWrapper = document.createElement("div");

        actionsWrapper.className = "action-buttons";

        if (record.returned === true) {
            const completedText = document.createElement("span");

            completedText.className = "completed-text";
            completedText.textContent = "✓ Completed";

            actionsWrapper.appendChild(completedText);
        } else {
            actionsWrapper.appendChild(
                createActionButton(
                    "✓ Mark Returned",
                    "return-book",
                    record.id,
                    "btn-return"
                )
            );
        }

        actionsWrapper.appendChild(
            createActionButton(
                "Delete",
                "delete-borrow",
                record.id,
                "btn-delete"
            )
        );

        actionsCell.appendChild(actionsWrapper);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Create a borrow record
document.getElementById("borrow-form").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const bookId = document.getElementById("borrow-book").value;
        const memberId = document.getElementById("borrow-member").value;
        const issueDate = document.getElementById("issue-date").value;
        const dueDate = document.getElementById("due-date").value;

        if (!bookId || !memberId || !issueDate) {
            showMessage(
                "Please select a book, member, and issue date.",
                "error"
            );
            return;
        }

        if (dueDate && dueDate < issueDate) {
            showMessage(
                "Expected return date cannot be before the issue date.",
                "error"
            );
            return;
        }

        const record = {
            book: {
                id: Number(bookId)
            },
            member: {
                id: Number(memberId)
            },
            issueDate: issueDate,
            returnDate: dueDate || null
        };

        try {
            await apiRequest("/borrow-records", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(record)
            });

            document.getElementById("borrow-form").reset();

            // Set the issue date back to today's local date.
            setTodayAsIssueDate();

            await refreshAll();

            showMessage("Borrow record created successfully.");
        } catch (error) {
            console.error("Borrow record error:", error);

            showMessage(
                error.message || "Could not create the borrow record.",
                "error"
            );
        }
    }
);

// Mark a book as returned
async function markBookReturned(id) {
    const confirmed = confirm(
        "Confirm that this book has been returned?"
    );

    if (!confirmed) return;

    try {
        await apiRequest(`/borrow-records/${id}/return`, {
            method: "PUT"
        });

        await refreshAll();

        showMessage("✓ Book marked as returned successfully.");
    } catch (error) {
        console.error("Return book error:", error);

        showMessage(
            error.message || "Could not mark the book as returned.",
            "error"
        );
    }
}

// Delete a borrow record
async function deleteBorrowRecord(id) {
    const confirmed = confirm(
        "Delete this borrow record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
        await apiRequest(`/borrow-records/${id}`, {
            method: "DELETE"
        });

        await refreshAll();

        showMessage("Borrow record deleted successfully.");
    } catch (error) {
        console.error("Borrow record deletion error:", error);

        showMessage(
            error.message || "Could not delete the borrow record.",
            "error"
        );
    }
}

// Handle action buttons in the tables
document.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit-book") editBook(id);
    if (action === "delete-book") deleteBook(id);

    if (action === "edit-member") editMember(id);
    if (action === "delete-member") deleteMember(id);

    if (action === "return-book") markBookReturned(id);
    if (action === "delete-borrow") deleteBorrowRecord(id);
});

// Cancel editing
document.getElementById("book-cancel-btn").addEventListener(
    "click",
    resetBookForm
);

document.getElementById("member-cancel-btn").addEventListener(
    "click",
    resetMemberForm
);

// Search as the user types
document.getElementById("book-search").addEventListener(
    "input",
    renderBooks
);

document.getElementById("member-search").addEventListener(
    "input",
    renderMembers
);

document.getElementById("borrow-search").addEventListener(
    "input",
    renderBorrowRecords
);

// Set the issue date using the browser's local date
function setTodayAsIssueDate() {
    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    document.getElementById("issue-date").value = localDate;
}

// Load data when the page opens
document.addEventListener("DOMContentLoaded", function () {
    setTodayAsIssueDate();
    refreshAll();
});