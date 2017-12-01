

### Git diff

1. Fork repo của hội đồng thi
2. Clone repo vừa fork về
3. Tạo 1 repo trên tài khoản của mình và clone về
4. Thêm các thư mục: backup, Đông, Công, Thạo, finnal vào.
5.  Phát triển, cũng như push code trên repo ở tài khoản của mình
6. Copy thư mục finnal vào trong repo đã fork về
7. Sinh ra .diff file giữa commit đầu tiên khi clone về và commit cuối cùng khi push code lên:

	```sh
	$ git log //show all comit

	$ git diff commit1 commit2 > bkcloud.diff
	# list all diff of the first commit 1 with last commit2
	```

8. Push code và file bkcloud.diff lên rồi gửi pull request tới repo của hội đồng thi.


