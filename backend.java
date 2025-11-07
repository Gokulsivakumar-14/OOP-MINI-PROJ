import static spark.Spark.*;
import com.google.gson.Gson;
import java.util.*;

// ===================== MODELS =====================
class Book {
    int id;
    String title;
    boolean issued;
    int issuedCount;

    Book(int id, String title) {
        this.id = id;
        this.title = title;
        this.issued = false;
        this.issuedCount = 0;
    }
}

class Member {
    int id;
    String name;

    Member(int id, String name) {
        this.id = id;
        this.name = name;
    }
}

class History {
    int bookId;
    String bookTitle;
    int memberId;
    String memberName;
    String action;  // "Issued" or "Returned"
    String dateTime;

    History(int bookId, String bookTitle, int memberId, String memberName, String action) {
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.memberId = memberId;
        this.memberName = memberName;
        this.action = action;
        this.dateTime = new Date().toString();
    }
}

class Admin {
    String username;
    String password;
}

// ===================== MAIN BACKEND =====================
public class Backend {

    static ArrayList<Book> books = new ArrayList<>();
    static ArrayList<Member> members = new ArrayList<>();
    static ArrayList<History> history = new ArrayList<>();
    static Gson gson = new Gson();

    public static void main(String[] args) {

        port(8080);
        enableCORS();

        seedData();

        System.out.println("✅ Backend Running at http://localhost:8080/");
        System.out.println("⏳ Waiting for requests...");

        // ------------------ LOGIN API ------------------
        post("/admin/login", (req, res) -> {
            Admin admin = gson.fromJson(req.body(), Admin.class);

            if (admin.username.equals("admin") && admin.password.equals("123")) {
                return "✅ Login Success";
            }
            return "❌ Invalid Username or Password";
        });

        // ------------------ GET APIs ------------------
        get("/books", (req, res) -> json(books));
        get("/members", (req, res) -> json(members));
        get("/history", (req, res) -> json(history));

        // ------------------ SEARCH API ------------------
        get("/search/:text", (req,res) -> {
            String input = req.params(":text").toLowerCase();
            ArrayList<Book> result = new ArrayList<>();
            for (Book b : books) {
                if (String.valueOf(b.id).contains(input) || b.title.toLowerCase().contains(input)) {
                    result.add(b);
                }
            }
            return json(result);
        });

        // ------------------ ADD APIs ------------------
        post("/book/add", (req, res) -> {
            Book b = gson.fromJson(req.body(), Book.class);
            books.add(b);
            return "✅ Book Added Successfully";
        });

        post("/member/add", (req, res) -> {
            Member m = gson.fromJson(req.body(), Member.class);
            members.add(m);
            return "✅ Member Added Successfully";
        });

        // ------------------ ISSUE BOOK ------------------
        post("/book/issue/:bookId/:memberId", (req, res) -> {
            int bookId = Integer.parseInt(req.params(":bookId"));
            int memberId = Integer.parseInt(req.params(":memberId"));

            Book b = findBook(bookId);
            Member m = findMember(memberId);

            if (b == null) return "❌ Book Not Found";
            if (m == null) return "❌ Member Not Found";
            if (b.issued) return "⚠ Book Already Issued";

            b.issued = true;
            b.issuedCount++;

            history.add(new History(bookId, b.title, memberId, m.name, "Issued"));

            return "✅ Book Issued Successfully";
        });

        // ------------------ RETURN BOOK ------------------
        post("/book/return/:bookId", (req, res) -> {
            int bookId = Integer.parseInt(req.params(":bookId"));
            Book b = findBook(bookId);

            if (b == null || !b.issued) return "❌ Invalid Return: Book Not Issued";

            b.issued = false;

            Member m = findIssuedMember(bookId);
            history.add(new History(bookId, b.title, m.id, m.name, "Returned"));

            return "✅ Book Returned Successfully";
        });

        // ------------------ DELETE APIs ------------------
        delete("/book/remove/:bookId", (req, res) -> {
            int id = Integer.parseInt(req.params(":bookId"));
            books.removeIf(b -> b.id == id);
            return "✅ Book Removed";
        });

        delete("/member/remove/:memberId", (req, res) -> {
            int id = Integer.parseInt(req.params(":memberId"));
            members.removeIf(m -> m.id == id);
            return "✅ Member Removed";
        });

        // ------------------ EXPORT JSON (for PDF generator) ------------------
        get("/export/report", (req, res) -> {
            HashMap<String, Object> export = new HashMap<>();
            export.put("books", books);
            export.put("members", members);
            export.put("history", history);
            return json(export);
        });
    }

    // ---------- Helper Functions ----------
    private static Book findBook(int id) {
        return books.stream().filter(b -> b.id == id).findFirst().orElse(null);
    }

    private static Member findMember(int id) {
        return members.stream().filter(m -> m.id == id).findFirst().orElse(null);
    }

    private static Member findIssuedMember(int bookId) {
        return history.stream()
                .filter(h -> h.bookId == bookId && h.action.equals("Issued"))
                .map(h -> findMember(h.memberId))
                .findFirst()
                .orElse(null);
    }

    private static String json(Object obj) {
        return gson.toJson(obj);
    }

    private static void seedData() {
        books.add(new Book(1, "Java Programming"));
        books.add(new Book(2, "Data Structures"));
        books.add(new Book(3, "Python Programming"));

        members.add(new Member(2117240020101, "Gokul"));
        members.add(new Member(2117240020102, "Tinku"));
    }

    // ✅ Allow frontend to connect (CORS)
    private static void enableCORS() {
        options("/*", (req, res) -> {
            res.header("Access-Control-Allow-Headers", req.headers("Access-Control-Request-Headers"));
            res.header("Access-Control-Allow-Methods", req.headers("Access-Control-Request-Method"));
            return "OK";
        });

        before((req, res) -> res.header("Access-Control-Allow-Origin", "*"));
    }
}
