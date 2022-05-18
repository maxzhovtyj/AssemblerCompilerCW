.386

Data1 		segment	
	String		db		'String'
	Val				db		101b
	Vw 				dw 		1234d
	Vd 				dd 		0d7856fdah
Data1 		ends

Data2 		segment
	Var				dw 		123
	QWERTY		dd		67ff89h
	Zxcv			db		89h
Data2 		ends

Code1 		segment
Assume 		cs:Code1, ds:Data1, gs:Data2
begin:	
	nop
	nop
	nop
	imul 		bl
	mul	  	    byte ptr gs:[ebx + ecx]
	idiv 		bl
	or 			byte ptr ds:[edx + esi], 111b
	sub 		dword ptr [ebx + ecx], eax
	cmp 		eax, 0AB142h
	Jmp			short label1
label1:
	cmp 		eax, 'text'
	jnb 		label2
	adc 		al, byte ptr [edx + esi]
	jmp 		short label1
label2:
	cmp 		al, 111b
	jnb 		label2
	nop
	nop
Code1 		ends

end