# Game purchase streaming

The idea is to abandon the classic demo versions of games, where the content is cut down, which does not allow you to adequately evaluate the game. With streaming purchases, anyone can pay for the first hours of playing, and cancel at any time if they don't like the game. If the game turned out to be good, then after paying the full amount, it forever goes to the player's library

This is an MVP, so it launches only one built-in game in browser. But the stream is actually works!

When starting game purchase stream, script starts Roketo script with `gamesmartpay` description. With every login on site, script checks current user outgoing streams, and get last with this description.
