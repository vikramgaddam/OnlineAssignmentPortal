#include<stdio.h>
int main(){
int n,a,b;
scanf("%d",&n);
int i;
for(int i=0;i<n;i++)
{
scanf("%d",&a);
scanf("%d",&b);
if(i!=n-1)
printf("%d\n",a*b);
else
printf("%d",a*b);
}
return 0;
}