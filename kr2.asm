.486

Data1 		segment	use16
	String		db		'String'
	Val				db		101b
	Vw 				dw 		1234d
	Vd 				dd 		0d7856fdah
Data1 		ends

Data2 		segment use16
	Var				dw 		123
	QWERTY		dd		67ff89h
	Zxcv			db		89h
Data2 		ends

Code1 		segment	use16
Assume 		cs:Code1, ds:Data1, gs:Data2
begin:	
	nop
	nop
	nop
	imul 		bl
	mul	  	byte ptr gs:[ebx + ecx]
	idiv 		bl
	or 			byte ptr ds:[edx + esi], 111b
	sub 		dword ptr [ebx + ecx], eax
	cmp 		eax, gs:QWERTY
	Jmp			short label1
label1:
	cmp 		al, String
	jnb 		short label2
	adc 		al, byte ptr [edx + esi]
	jmp 		label1
label2:
	cmp 		al, bl
	jnb 		label2
	nop
	nop
Code1 		ends

end begin