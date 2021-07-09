<pre>
    <ul>
        <?php foreach (glob("*.{jpg,jpeg,png,mp4}", GLOB_BRACE) as $file) {
            echo "<li><a href='$file'>$file</a></li>";
        }