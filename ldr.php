<?php
/**
 * Leaderboard for uHunt problems
 * @author Patrick Nikic (pnikic@mathos.hr)
 * @version 1.1 12/11/18
 */

$string = file_get_contents("/home1/studenti/pnikic/public_html/ldr/results.json");
$res = json_decode($string, true);

echo '<head>';
echo '<style>';
echo '.ac {';
echo 'background-color: #00809a;';
echo 'color: white;';
echo 'font-weight: bold;';
echo '}';
echo 'table.cpTable {';
echo 'font-family: Georgia, serif;';
echo 'background-color: #F5F5F5;';
echo 'width: 100%;';
echo 'text-align: center;';
echo 'border-collapse: collapse;';
echo '}';
echo 'table.cpTable td, table.cpTable th {';
echo 'padding: 4px 2px;';
echo '}';
echo 'table.cpTable tbody td {';
echo 'font-size: 15px;';
echo '}';
echo 'table.cpTable tr:nth-child(even) {';
echo 'background: #FFFFFF;';
echo '}';
echo 'table.cpTable thead {';
echo 'background: #FFFFFF;';
echo 'border-bottom: 1px solid black;';
echo '}';
echo 'table.cpTable thead th {';
echo 'font-size: 15px;';
echo 'font-weight: bold;';
echo 'color: #000000;';
echo '}';
echo 'table.cpTable tfoot .links a{';
echo 'display: inline-block;';
echo 'background: #1C6EA4;';
echo 'color: #FFFFFF;';
echo 'padding: 2px 8px;';
echo 'border-radius: 5px;';
echo '}';
echo '.dotted {';
echo 'border-bottom: 2px dotted white;';
echo '}';
echo '.ttip {';
echo 'color: white;';
echo 'width: 100%;';
echo 'position: relative;';
echo 'display: inline-block;';
echo '}';
echo '.ttip .text {';
echo 'visibility: hidden;';
echo 'background-color: black;';
echo 'color: #fff;';
echo 'border-radius: 6px;';
echo 'padding: 5px 0;';
echo '';
echo '/* Position the tooltip */';
echo 'position: absolute;';
echo 'left: -150px;';
echo 'top: -24px;';
echo 'z-index: 1;';
echo '}';
echo '.ttip:hover .text {';
echo 'visibility: visible;';
echo 'border-radius: 8px;';
echo 'background-color: #000;';
echo 'color: #fff;';
echo 'text-align: right;';
echo 'font-size: 12px!important;';
echo 'padding: 10px 20px;';
echo '}';
echo '</style>';
echo '</head>';
echo '<body>';
echo '<table class="cpTable">';
echo '<caption><h2>  ♔  ALL TIME  ♚  </h2></caption>';
echo '<thead>';
echo '<tr>';
echo '<th>Natjecatelj</th>';
echo '<th>CF rating</th>';
echo '<th>AC</th>';
echo '</tr>';
echo '</thead>';
echo '<tbody id="cpTableBody">';
foreach ($res['table'] as $i) {
    echo '<tr><td>'
       . $i[user] . '</td><td>'
       . $i[cf_rating] . '</td><td class="ac"><div class="ttip"><span class="dotted">'
       . $i[score] . '</span><span class="text">CF:&nbsp;'
       . $i[cf_ac] . '<br/>uHunt:&nbsp;'
       . $i[uva_ac] . '<br/>uHunt ICPC:&nbsp;'
       . $i[icpc_ac] . '</span></div></td></tr>';

}
echo '</tbody>';
echo '</table>';
echo '<br/>';

$string = file_get_contents("/home1/studenti/pnikic/public_html/ldr/results_newest.json");
$res = json_decode($string, true);
echo '<table class="cpTable">';
echo '<caption><h2>  ♘ LAST 7 DAYS ♞  </h2></caption>';
echo '<thead>';
echo '<tr>';
echo '<th>Natjecatelj</th>';
echo '<th>CF rating</th>';
echo '<th>AC</th>';
echo '</tr>';
echo '</thead>';
echo '<tbody id="cpTableBody">';
foreach ($res['table'] as $i) {
    echo '<tr><td>'
       . $i[user] . '</td><td>'
       . $i[cf_rating] . '</td><td class="ac"><div class="ttip"><span class="dotted">'
       . $i[score] . '</span><span class="text">CF:&nbsp;'
       . $i[cf_ac] . '<br/>uHunt:&nbsp;'
       . $i[uva_ac] . '<br/>uHunt ICPC:&nbsp;'
       . $i[icpc_ac] . '</span></div></td></tr>';

}
echo '</tbody>';
echo '</table>';

$last = file_get_contents("/home1/studenti/pnikic/public_html/ldr/results_time.txt");
$gmt = strpos($last, "GMT");
echo '<footer>';
echo '<p><br>Last updated: ' . substr($last, 4, $gmt - 1 - 4) . '</p>';
echo '<p>Suggestions: Patrick Nikić (<a href="mailto:pnikic@mathos.hr">pnikic@mathos.hr</a>)</p>';
echo '</footer>';
?>
