quicksort :: [Int] -> [Int]
quicksort [] = []
quicksort (x:xs)=
 let smallersorted = quicksort(filter (<x) xs)
     biggersorted = quicksort(filter(>=x) xs)
 in smallersorted ++ [x] ++ biggersorted