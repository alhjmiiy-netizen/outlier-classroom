// C replaces C#; Verilog framed as hardware; cross-skill final exam bank
(function(){const L=window.LESSONS,X=window.EXTRA;const i=L.findIndex(l=>l.skill==='C#');
L[i]={skill:"C",title:"The Language Under Everything",why:"C is the grandparent of most languages you'll learn. Operating systems, databases, Python itself — all built in C. Learn C and you see how computers really handle memory.",
breakdown:"C is a small, fast language from the 1970s that's still everywhere. It gives you almost no safety net: you manage memory yourself, you work with raw addresses (pointers), and the compiler turns your code straight into machine instructions. There are no classes — you group data with structs and share code through header (.h) files. When you understand C, you understand what Java, Python, and JavaScript are doing for you behind the scenes.",
concepts:["main() is where every C program starts","#include pulls in header files like <stdio.h>","printf with format codes: %d, %f, %s","Pointers store addresses: int *p = &x;","Arrays are blocks of memory; strings are char arrays ending in \\0","malloc/free: you borrow and return heap memory","structs group related data","Compiling: gcc main.c -o main"],
project:{type:"quiz",prompt:"Fill the blanks and predict the output.",questions:[
{q:"Fill the blank to print a number:\nprintf(\"%_\", 42);",a:["d"]},
{q:"Predict the output:\nint x = 4;\nint *p = &x;\n*p = *p + 3;\nprintf(\"%d\", x);",a:["7"],hint:"p points at x, so changing *p changes x."},
{q:"Fill the blank to free memory you got from malloc:\nint *a = malloc(10 * sizeof(int));\n____(a);",a:["free"]},
{q:"Predict the output:\nstruct Pt { int x; int y; };\nstruct Pt p = {2, 5};\nprintf(\"%d\", p.x + p.y);",a:["7"]}]}};
X.C={fund:"A C program is one or more .c files plus header (.h) files. The preprocessor handles #include and #define first, then the compiler turns each .c file into object code, then the linker joins them into one executable. Variables have fixed types (int, char, float, double) and sizes. Memory lives in two main places: the stack (local variables, freed automatically when a function returns) and the heap (malloc gives it, free returns it). A pointer holds an address: & gets an address, * follows one. Arrays and pointers are closely related — an array name acts like a pointer to its first element. Strings are just char arrays ending with a '\\0' byte. Structs bundle fields together, and you pass pointers to structs to avoid copying.",
matters:"Pointers and manual memory. Every malloc needs exactly one free, and you never touch memory you don't own.",
dos:["Initialize every variable and pointer (use NULL for empty pointers)","free every malloc exactly once","Check if malloc returned NULL","Compile with warnings: gcc -Wall -Wextra","Put function declarations in .h files and code in .c files"],
donts:["Don't read or write past the end of an array","Don't use memory after freeing it","Don't return the address of a local variable","Don't use gets() — it's unsafe; use fgets()"],
mistakes:["Forgetting & in scanf(\"%d\", &x)","Off-by-one: an array of 5 has indexes 0–4","Forgetting room for '\\0' at the end of a string","Memory leaks from malloc without free"],
T:[["Every C program starts running at:",["start()","main()","init()","the first #include"],1,"main is the entry point."],
["Which header gives you printf?",["<stdlib.h>","<stdio.h>","<string.h>","<print.h>"],1,"stdio = standard input/output."],
["&x gives you:",["The value of x","The address of x","A copy of x","x squared"],1,"& = address-of."],
["If int *p = &x; then *p is:",["x's address","x's value","NULL","Always 0"],1,"* follows the pointer."],
["Heap memory is requested with:",["new","malloc","alloc()","heap()"],1,"malloc; return it with free."],
["Forgetting free() causes:",["A syntax error","A memory leak","Faster code","Nothing"],1,"The memory is never returned."],
["A C string ends with:",["'\\n'","'\\0'","EOF","a space"],1,"The null terminator."],
["Group related fields together with:",["class","struct","object","module"],1,"C has structs, not classes."],
["printf(\"%d\", 7/2) prints:",["3.5","3","4","Error"],1,"Integer division drops the decimal."],
["Command that compiles main.c into a program named main:",["run main.c","gcc main.c -o main","c main","make c"],1,"gcc compiles and links."],
["Header (.h) files mainly contain:",["Declarations shared between files","Images","The main function only","Compiled code"],0,"Declarations go in .h, code in .c."],
["Accessing arr[5] in int arr[5] is:",["The last element","Out of bounds — undefined behavior","Zero","Automatically resized"],1,"Valid indexes are 0–4."]]};
const v=L.find(l=>l.skill==='Verilog');v.hw=true;v.title="Hardware Lab: Designing the Circuit Itself";
v.why="Today we step out of software and into the lab. Verilog doesn't give instructions to a computer — it describes the computer. The circuits you write here can become real wires and gates on a chip.";
v.breakdown="Every class so far was software: steps a processor follows one at a time. Verilog is a hardware description language (HDL). You describe circuits: modules with input and output pins, wires that carry signals, and registers that remember values. Everything in a circuit runs at the same time — in parallel — and clocked parts update together on each tick of the clock. You first simulate your design (testing it in software with a testbench), then synthesis tools turn it into real gates on an FPGA or chip. Different mindset, same goal: make something that works.";
v.concepts=["module ... endmodule: one circuit block with ports","input / output ports are the circuit's pins","wire: a connection driven continuously (assign)","reg: holds a value set inside an always block","Combinational logic: assign / always @(*) — reacts instantly","Sequential logic: always @(posedge clk) with <= — updates on the clock","Parallelism: every block runs at the same time","Simulation (testbench, $display, #delays) vs synthesis (real gates)"];
X.Verilog.fund+=" Simulation and synthesis are different worlds: a testbench can use delays (#10) and $display to check behavior, but those lines never become hardware. Only synthesizable code (modules, assign, always blocks) turns into gates.";
X.Verilog.T.push(["What is a testbench for?",["It becomes part of the chip","It drives inputs and checks outputs in simulation","It speeds up the clock","It replaces the module"],1,"Testbenches only exist in simulation."],["Can '#10' delays be synthesized into real hardware?",["Yes, always","No — they're for simulation only","Only on FPGAs","Only with assign"],1,"Synthesis ignores delays."]);
window.CROSS=[
["An HTML button has class=\"buy\". Which pairing styles it and runs code on click?",[".buy { } in CSS and document.querySelector('.buy').addEventListener('click', fn) in JS","#buy { } and onclick(buy)","buy { } and click.buy()","<style buy> and <script buy>"],0,"CSS uses .class; JS selects the same class and listens for clicks."],
["In React + TypeScript, how do you type a component's props?",["interface Props { name: string } then function Card(props: Props)","props: any always","React.types(name)","You can't type props"],0,"Define an interface and annotate the props parameter."],
["Python running a SQL query: what keeps user input safe?",["cur.execute('SELECT * FROM t WHERE id = ?', (uid,))","f\"SELECT * FROM t WHERE id = {uid}\"","Add quotes around uid","Use print()"],0,"Parameterized queries stop SQL injection in any language."],
["You built a Go web server. To ship it in Docker, the Dockerfile usually starts with:",["FROM golang:1.22 (then builds a binary)","FROM html:5","git init","import docker"],0,"Start from a Go base image, build, then run the binary."],
["You changed index.html, style.css and app.js. Which Git commands save all three as one snapshot?",["git add . then git commit -m \"Update page\"","git push only","git log","git init again"],0,"Stage then commit — Git works the same for every language."],
["JavaScript fetches JSON from an API written in Python. What format do both sides agree on?",["JSON","CSS","Verilog","Dockerfile"],0,"JSON is the shared data format of the web."],
["Which languages compile straight to machine code (no VM)?",["C, C++, Go","Java, C#","Python, JavaScript","HTML, CSS"],0,"Java runs on the JVM; Python/JS are interpreted or JIT-compiled."],
["React state changes → screen updates. Which Swift/Dart feature works the same way?",["SwiftUI @State and Flutter setState","printf","git branch","SELECT"],0,"Declarative UI: change state, the framework redraws."],
["A Python app and a PostgreSQL database run together locally. Best Docker tool?",["docker compose","git merge","tsc","gcc"],0,"Compose runs multiple containers together."],
["Pointers in C and references in C++ both deal with:",["Memory addresses / aliases to data","CSS layout","Git history","SQL joins"],0,"Both let you work with data where it lives."],
["Where should your API keys go in a Git + Docker project?",["Environment variables, listed in .gitignore/.dockerignore files — never committed","Inside index.html","In the commit message","In a public README"],0,"Secrets stay out of Git and images."],
["TypeScript compiles to JavaScript. Verilog 'compiles' (synthesizes) to:",["Logic gates / hardware","JavaScript","Python bytecode","A Docker image"],0,"Synthesis turns HDL into circuits."],
["Java, C#-style, and Dart all organize code into:",["Classes","Tables","Modules with wires","Commits"],0,"They're class-based object-oriented languages."],
["Signals table in SQL → shown in a React list. The React part uses:",["signals.map(s => <li key={s.ticker}>{s.ticker}</li>)","SELECT inside JSX","CSS grid only","git log"],0,"Map over data with a key per item."],
["In both Go and C, how are errors usually reported?",["Return values you check (err != nil / return codes)","try/catch everywhere","CSS classes","They can't fail"],0,"Neither uses exceptions by default."],
["Python lists and JavaScript arrays both start indexing at:",["0","1","-1","It depends on the day"],0,"Zero-based indexing."]];
})();
